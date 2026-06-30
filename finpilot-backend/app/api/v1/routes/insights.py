"""Auto-generated AI insights endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.transaction import Transaction
from app.models.user import User
from app.ml.insights import generate_insights

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("")
async def get_insights(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Transaction).where(Transaction.user_id == user.id))
    transactions = list(result.scalars().all())
    return generate_insights(transactions)
