from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.transaction import Transaction, TransactionCategory, TransactionType
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.transaction import TransactionCreate, TransactionOut, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=PaginatedResponse[TransactionOut])
async def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[TransactionCategory] = None,
    type: Optional[TransactionType] = None,
    search: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Transaction).where(Transaction.user_id == user.id)
    count_query = select(func.count()).select_from(Transaction).where(Transaction.user_id == user.id)

    if category:
        query = query.where(Transaction.category == category)
        count_query = count_query.where(Transaction.category == category)
    if type:
        query = query.where(Transaction.type == type)
        count_query = count_query.where(Transaction.type == type)
    if search:
        query = query.where(Transaction.description.ilike(f"%{search}%"))
        count_query = count_query.where(Transaction.description.ilike(f"%{search}%"))

    total = (await db.execute(count_query)).scalar_one()

    query = query.order_by(Transaction.date.desc()).offset((page - 1) * page_size).limit(page_size)
    rows = (await db.execute(query)).scalars().all()

    return PaginatedResponse(
        data=rows,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(1, -(-total // page_size)),
    )


@router.post("", response_model=TransactionOut, status_code=201)
async def create_transaction(
    payload: TransactionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tx = Transaction(**payload.model_dump(), user_id=user.id)
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return tx


@router.get("/{transaction_id}", response_model=TransactionOut)
async def get_transaction(
    transaction_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tx = await _get_owned_transaction(transaction_id, user.id, db)
    return tx


@router.put("/{transaction_id}", response_model=TransactionOut)
async def update_transaction(
    transaction_id: UUID,
    payload: TransactionUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tx = await _get_owned_transaction(transaction_id, user.id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(tx, field, value)
    await db.commit()
    await db.refresh(tx)
    return tx


@router.delete("/{transaction_id}", status_code=204)
async def delete_transaction(
    transaction_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tx = await _get_owned_transaction(transaction_id, user.id, db)
    await db.delete(tx)
    await db.commit()


async def _get_owned_transaction(transaction_id: UUID, user_id: UUID, db: AsyncSession) -> Transaction:
    result = await db.execute(
        select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == user_id)
    )
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx
