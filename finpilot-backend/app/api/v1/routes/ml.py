from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.ml.services import (
    compute_health_score,
    detect_anomalies,
    detect_subscriptions,
    forecast_expenses,
)
from app.models.transaction import Transaction
from app.models.user import User

router = APIRouter(prefix="/ml", tags=["ml"])


async def _user_transactions(user: User, db: AsyncSession) -> list[Transaction]:
    result = await db.execute(select(Transaction).where(Transaction.user_id == user.id))
    return list(result.scalars().all())


@router.get("/forecast")
async def get_forecast(
    months: int = Query(3, ge=1, le=12),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    transactions = await _user_transactions(user, db)
    return forecast_expenses(transactions, months_ahead=months)


@router.get("/anomalies")
async def get_anomalies(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    transactions = await _user_transactions(user, db)
    return detect_anomalies(transactions)


@router.get("/health-score")
async def get_health_score(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    transactions = await _user_transactions(user, db)
    return compute_health_score(transactions)


@router.get("/subscriptions")
async def get_subscriptions(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    transactions = await _user_transactions(user, db)
    return detect_subscriptions(transactions)
