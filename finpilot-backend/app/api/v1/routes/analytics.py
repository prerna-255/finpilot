from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.transaction import Transaction, TransactionType
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])

CATEGORY_COLORS = {
    "housing": "#6366f1", "food": "#f59e0b", "transport": "#10b981",
    "shopping": "#ec4899", "entertainment": "#8b5cf6", "utilities": "#06b6d4",
    "health": "#ef4444", "education": "#3b82f6", "investments": "#14b8a6",
    "subscriptions": "#a855f7", "travel": "#f97316", "other": "#6b7280",
    "salary": "#22c55e", "freelance": "#22c55e",
}


def _period_bounds(period: str | None) -> tuple[date, date]:
    today = date.today()
    if period == "week":
        start = today - timedelta(days=7)
    elif period == "year":
        start = today.replace(month=1, day=1)
    else:  # default: current month
        start = today.replace(day=1)
    return start, today


@router.get("/summary")
async def get_summary(
    period: str | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    start, end = _period_bounds(period)

    income_q = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.user_id == user.id, Transaction.type == TransactionType.income,
        Transaction.date >= start, Transaction.date <= end,
    )
    expense_q = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.user_id == user.id, Transaction.type == TransactionType.expense,
        Transaction.date >= start, Transaction.date <= end,
    )

    total_income = (await db.execute(income_q)).scalar_one()
    total_expense = (await db.execute(expense_q)).scalar_one()
    net_savings = total_income - total_expense
    savings_rate = (net_savings / total_income * 100) if total_income else 0
    recent_query = (
    select(Transaction)
    .where(Transaction.user_id == user.id)
    .order_by(Transaction.date.desc())
    .limit(5)
)

    recent_transactions = (
    await db.execute(recent_query)
        ).scalars().all()
    category_query = (
    select(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    )
    .where(
        Transaction.user_id == user.id,
        Transaction.type == TransactionType.expense
    )
    .group_by(Transaction.category)
)

    category_rows = (await db.execute(category_query)).all()
    month_expr = func.to_char(Transaction.date, "YYYY-MM")

    trend_query = (
    select(
        month_expr.label("month"),
        Transaction.type,
        func.sum(Transaction.amount).label("total"),
    )
    .where(Transaction.user_id == user.id)
    .group_by(
        month_expr,
        Transaction.type,
    )
    .order_by(month_expr)
)

    trend_rows = (await db.execute(trend_query)).all()
    trend_data = {}

    for month, tx_type, total in trend_rows:
        if month not in trend_data:
            trend_data[month] = {
            "month": month,
            "income": 0,
            "expense": 0,
        }

        if tx_type == TransactionType.income:
            trend_data[month]["income"] = float(total)
        else:
            trend_data[month]["expense"] = float(total)
    return {
    "summary": {
        "totalIncome": float(total_income),
        "totalExpense": float(total_expense),
        "netSavings": float(net_savings),
        "netWorth": float(net_savings),  # temporary
        "financialHealthScore": round(savings_rate, 1),
        "budgetUsagePercent": 0,
        "monthOverMonthChange": {
            "income": 0,
            "expense": 0,
            "savings": 0,
        },
    },
    "trends": list(trend_data.values()),
    "categories": [
    {
        "name": category.value,
        "value": float(total),
        "color": CATEGORY_COLORS.get(category.value, "#6b7280"),
    }
    for category, total in category_rows
],
    "transactions": [
    {
        "id": str(tx.id),
        "merchant": tx.merchant,
        "description": tx.description,
        "category": tx.category.value,
        "date": tx.date.isoformat(),
        "amount": float(tx.amount),
        "type": tx.type.value,
        "icon": "💳",
    }
    for tx in recent_transactions
],
    "insights": [],
}


@router.get("/trends")
async def get_trends(
    months: int = Query(6, ge=1, le=24),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    month_expr = func.to_char(Transaction.date, "YYYY-MM")
    query = (
        select(
            month_expr.label("month"),
            Transaction.type,
            func.sum(Transaction.amount).label("total"),
        )
        .where(Transaction.user_id == user.id)
        .group_by(month_expr, Transaction.type)
        .order_by(month_expr)
    )
    rows = (await db.execute(query)).all()

    by_month: dict[str, dict[str, float]] = {}
    for month, tx_type, total in rows:
        by_month.setdefault(month, {"income": 0, "expense": 0})
        if tx_type.value in ("income",):
            by_month[month]["income"] = float(total)
        elif tx_type.value == "expense":
            by_month[month]["expense"] = float(total)

    sorted_months = sorted(by_month.keys())[-months:]
    return [
        {
            "month": m,
            "income": by_month[m]["income"],
            "expense": by_month[m]["expense"],
            "savings": by_month[m]["income"] - by_month[m]["expense"],
        }
        for m in sorted_months
    ]


@router.get("/categories")
async def get_category_breakdown(
    period: str | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    start, end = _period_bounds(period)
    query = (
        select(Transaction.category, func.sum(Transaction.amount), func.count())
        .where(
            Transaction.user_id == user.id,
            Transaction.type == TransactionType.expense,
            Transaction.date >= start,
            Transaction.date <= end,
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
    )
    rows = (await db.execute(query)).all()
    total = sum(float(amount) for _, amount, _ in rows) or 1

    return [
        {
            "category": category.value,
            "amount": float(amount),
            "percent": round(float(amount) / total * 100, 1),
            "count": count,
            "color": CATEGORY_COLORS.get(category.value, "#6b7280"),
        }
        for category, amount, count in rows
    ]


@router.get("/merchants")
async def get_top_merchants(
    limit: int = Query(10, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Transaction.merchant, func.sum(Transaction.amount), func.count())
        .where(Transaction.user_id == user.id, Transaction.merchant.is_not(None))
        .group_by(Transaction.merchant)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(limit)
    )
    rows = (await db.execute(query)).all()
    return [{"merchant": m, "amount": float(a), "count": c} for m, a, c in rows]
@router.get("/heatmap")
async def get_heatmap(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(
            Transaction.date,
            func.count(Transaction.id).label("count"),
        )
        .where(Transaction.user_id == user.id)
        .group_by(Transaction.date)
        .order_by(Transaction.date)
    )

    rows = (await db.execute(query)).all()

    return [
        {
            "date": tx_date.isoformat(),
            "count": count,
        }
        for tx_date, count in rows
    ]
