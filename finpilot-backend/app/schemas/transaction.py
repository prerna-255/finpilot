from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel
from app.models.transaction import TransactionCategory, TransactionType


class TransactionBase(BaseModel):
    date: date
    description: str
    amount: float
    currency: str = "INR"
    type: TransactionType
    category: TransactionCategory
    merchant: str | None = None
    account: str | None = None
    notes: str | None = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    description: str | None = None
    amount: float | None = None
    category: TransactionCategory | None = None
    notes: str | None = None


class TransactionOut(TransactionBase):
    id: UUID
    is_anomaly: bool
    is_recurring: bool
    created_at: datetime

    class Config:
        from_attributes = True
