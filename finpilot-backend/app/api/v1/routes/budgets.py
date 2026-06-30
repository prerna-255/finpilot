from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.budget import Budget
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetOut, BudgetUpdate

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=list[BudgetOut])
async def list_budgets(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Budget).where(Budget.user_id == user.id))
    return result.scalars().all()


@router.post("", response_model=BudgetOut, status_code=201)
async def create_budget(
    payload: BudgetCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check for duplicate category+period
    existing = await db.execute(
        select(Budget).where(Budget.user_id == user.id, Budget.category == payload.category, Budget.period == payload.period)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Budget for this category and period already exists")
    budget = Budget(**payload.model_dump(), user_id=user.id)
    db.add(budget)
    await db.commit()
    await db.refresh(budget)
    return budget


@router.put("/{budget_id}", response_model=BudgetOut)
async def update_budget(
    budget_id: UUID,
    payload: BudgetUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Budget).where(Budget.id == budget_id, Budget.user_id == user.id))
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(budget, field, value)
    await db.commit()
    await db.refresh(budget)
    return budget


@router.delete("/{budget_id}", status_code=204)
async def delete_budget(budget_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Budget).where(Budget.id == budget_id, Budget.user_id == user.id))
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    await db.delete(budget)
    await db.commit()
