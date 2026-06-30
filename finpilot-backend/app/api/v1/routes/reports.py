from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportOut, ReportGenerate
import google.generativeai as genai

from app.core.config import settings
from app.models.transaction import Transaction
from app.ml.services import compute_health_score, transactions_to_df
from app.ml.insights import generate_insights
router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=list[ReportOut])
async def list_reports(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Report)
        .where(Report.user_id == user.id)
        .order_by(Report.generated_at.desc())
    )
    return result.scalars().all()

async def build_financial_summary(user: User, db: AsyncSession):
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == user.id)
    )
    transactions = list(result.scalars().all())

    if not transactions:
        return "The user has no transactions yet."

    df = transactions_to_df(transactions)

    income = df[df["type"] == "income"]["amount"].sum()
    expenses = df[df["type"] == "expense"]["amount"].sum()

    health = compute_health_score(transactions)

    insights = generate_insights(transactions)

    top_categories = (
        df[df["type"] == "expense"]
        .groupby("category")["amount"]
        .sum()
        .nlargest(5)
        .to_dict()
    )

    return f"""
Income: ₹{income:,.2f}
Expenses: ₹{expenses:,.2f}
Savings: ₹{income-expenses:,.2f}
Health Score: {health["score"]}/100
Top Spending Categories: {top_categories}
Insights: {[i["message"] for i in insights]}
"""
@router.post("/generate", response_model=ReportOut)
async def generate_report(
    payload: ReportGenerate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    financial_data = await build_financial_summary(user, db)

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
You are FinPilot AI.

Generate a professional financial report in markdown.

Financial Period:
{payload.period}

User Financial Data:
{financial_data}

Include:

# Financial Summary
# Key Insights
# Spending Analysis
# Savings Analysis
# Recommendations

Keep it around 300-500 words.
"""

    response = model.generate_content(prompt)

    summary = response.text if response.text else "Unable to generate report."

    report = Report(
        user_id=user.id,
        title=f"{payload.period} Financial Report",
        period=payload.period,
        summary=summary,
    )

    db.add(report)
    await db.commit()
    await db.refresh(report)

    return report