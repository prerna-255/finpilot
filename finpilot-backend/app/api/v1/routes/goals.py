import json
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.goal import Goal
from app.models.transaction import Transaction
from app.models.user import User
from app.ml.goal_planner import compute_goal_plan
from app.schemas.goal import GoalCreate, GoalDeposit, GoalOut

router = APIRouter(prefix="/goals", tags=["goals"])


async def _get_user_transactions(user_id, db):
    result = await db.execute(select(Transaction).where(Transaction.user_id == user_id))
    return list(result.scalars().all())


@router.get("", response_model=list[GoalOut])
async def list_goals(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Goal).where(Goal.user_id == user.id).order_by(Goal.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=GoalOut, status_code=201)
async def create_goal(
    payload: GoalCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    goal = Goal(**payload.model_dump(), user_id=user.id)
    transactions = await _get_user_transactions(user.id, db)
    plan = compute_goal_plan(goal, transactions)
    goal.monthly_savings_needed = plan["monthly_savings_needed"]
    goal.probability = plan["probability"]
    goal.suggestions = plan["suggestions"]
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return goal


@router.get("/{goal_id}", response_model=GoalOut)
async def get_goal(goal_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Goal).where(Goal.id == goal_id, Goal.user_id == user.id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.post("/{goal_id}/deposit", response_model=GoalOut)
async def deposit_to_goal(
    goal_id: UUID,
    payload: GoalDeposit,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Goal).where(Goal.id == goal_id, Goal.user_id == user.id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    goal.current_amount += payload.amount
    if goal.current_amount >= goal.target_amount:
        goal.is_completed = True
    transactions = await _get_user_transactions(user.id, db)
    plan = compute_goal_plan(goal, transactions)
    goal.monthly_savings_needed = plan["monthly_savings_needed"]
    goal.probability = plan["probability"]
    await db.commit()
    await db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=204)
async def delete_goal(goal_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Goal).where(Goal.id == goal_id, Goal.user_id == user.id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    await db.delete(goal)
    await db.commit()
