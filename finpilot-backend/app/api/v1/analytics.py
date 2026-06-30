from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.transaction import Transaction
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
async def get_summary(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == user.id)
    )

    transactions = result.scalars().all()

    income = sum(
        t.amount
        for t in transactions
        if t.amount > 0
    )

    expense = sum(
        abs(t.amount)
        for t in transactions
        if t.amount < 0
    )

    savings = income - expense

    category_map = {}

    for t in transactions:
        if t.amount < 0:
            category = t.category or "Other"
            category_map[category] = category_map.get(category, 0) + abs(t.amount)

    categories = [
        {
            "name": k,
            "value": v,
        }
        for k, v in category_map.items()
    ]

    recent_transactions = sorted(
        transactions,
        key=lambda x: x.date,
        reverse=True,
    )[:10]

    recent = [
        {
            "id": str(t.id),
            "merchant": t.merchant,
            "category": t.category,
            "amount": t.amount,
            "date": t.date,
        }
        for t in recent_transactions
    ]

    return {
        "summary": {
            "totalIncome": income,
            "totalExpense": expense,
            "netSavings": savings,
            "netWorth": savings,
            "financialHealthScore": 0,
            "budgetUsagePercent": 0,
        },
        "categories": categories,
        "transactions": recent,
        "insights": [],
    }