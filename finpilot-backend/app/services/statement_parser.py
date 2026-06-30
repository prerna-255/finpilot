"""Parses CSV/Excel/PDF bank statements into normalized transaction rows."""
from __future__ import annotations
import io
import re
from datetime import datetime, date
import pandas as pd


CATEGORY_KEYWORDS = {
    "food": ["zomato", "swiggy", "zepto", "restaurant", "cafe", "food", "blinkit"],
    "transport": ["uber", "ola", "rapido", "fuel", "petrol", "metro", "irctc"],
    "shopping": ["amazon", "flipkart", "myntra", "mall", "ajio", "nykaa"],
    "entertainment": ["netflix", "spotify", "hotstar", "bookmyshow", "prime video", "youtube"],
    "utilities": ["electricity", "water bill", "broadband", "wifi", "recharge", "airtel", "jio"],
    "housing": ["rent", "maintenance", "society"],
    "health": ["pharmacy", "hospital", "clinic", "apollo", "1mg", "medplus"],
    "subscriptions": ["subscription", "membership", "adobe", "microsoft"],
    "salary": ["salary", "payroll", "ctc"],
    "investments": ["zerodha", "groww", "mutual fund", "sip", "nps"],
}

DATE_FORMATS = ["%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y", "%d %b %Y", "%d-%b-%Y"]


def guess_category(description: str) -> str:
    desc = description.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in desc for kw in keywords):
            return category
    return "other"


from datetime import datetime, date

def normalize_date(value) -> date:
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(str(value).strip(), fmt).date()
        except ValueError:
            continue

    parsed = pd.to_datetime(value, errors="coerce")

    if pd.isna(parsed):
        raise ValueError(f"Invalid date: {value}")

    return parsed.date()


def _normalize_dataframe(df: pd.DataFrame) -> list[dict]:
    cols = {c.lower().strip(): c for c in df.columns}
    date_col = next((cols[c] for c in cols if "date" in c), None)
    desc_col = next((cols[c] for c in cols if any(k in c for k in ["narration", "description", "particulars", "details", "remarks"])), None)
    debit_col = next((cols[c] for c in cols if "debit" in c or "withdrawal" in c), None)
    credit_col = next((cols[c] for c in cols if "credit" in c or "deposit" in c), None)
    amount_col = next((cols[c] for c in cols if c == "amount"), None)

    if not date_col or not desc_col:
        raise ValueError("Could not detect date/description columns")

    rows = []
    for _, row in df.iterrows():
        description = str(row[desc_col]).strip()
        if not description or description.lower() == "nan":
            continue
        if amount_col:
            amount = float(row[amount_col])
            income_keywords = [
            "salary",
            "payroll",
            "refund",
            "interest",
            "cashback",
            ]

            if any(word in description.lower() for word in income_keywords):
                 tx_type = "income"
            else:
                tx_type = "expense"
                amount = abs(amount)
        else:
            debit = float(row[debit_col]) if debit_col and pd.notna(row.get(debit_col)) else 0
            credit = float(row[credit_col]) if credit_col and pd.notna(row.get(credit_col)) else 0
            if credit > 0:
                amount, tx_type = credit, "income"
            else:
                amount, tx_type = debit, "expense"
        if amount == 0:
            continue
        rows.append({
            "date": normalize_date(row[date_col]),
            "description": description,
            "amount": amount,
            "type": tx_type,
            "category": "salary" if tx_type == "income" else guess_category(description),
            "merchant": re.split(r"[/|\-]", description)[0].strip()[:50] or None,
            "currency": "INR",
        })
    return rows


def parse_csv(content: bytes) -> list[dict]:
    df = pd.read_csv(io.BytesIO(content))
    return _normalize_dataframe(df)


def parse_excel(content: bytes) -> list[dict]:
    df = pd.read_excel(io.BytesIO(content))
    return _normalize_dataframe(df)


def parse_pdf(content: bytes) -> list[dict]:
    import pdfplumber
    all_rows: list[dict] = []
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                if not table or len(table) < 2:
                    continue
                header, *body = table
                df = pd.DataFrame(body, columns=header)
                try:
                    all_rows.extend(_normalize_dataframe(df))
                except ValueError:
                    continue
    return all_rows


def parse_statement(filename: str, content: bytes) -> list[dict]:
    ext = filename.lower().rsplit(".", 1)[-1]
    if ext == "csv":
        return parse_csv(content)
    if ext in ("xlsx", "xls"):
        return parse_excel(content)
    if ext == "pdf":
        return parse_pdf(content)
    raise ValueError(f"Unsupported file format: .{ext}")
