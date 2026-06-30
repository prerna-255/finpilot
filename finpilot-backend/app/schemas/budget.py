from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from app.models.budget import BudgetPeriod
from app.models.transaction import TransactionCategory


class BudgetCreate(BaseModel):
    category: TransactionCategory
    amount: float
    period: BudgetPeriod = BudgetPeriod.monthly


class BudgetUpdate(BaseModel):
    amount: float | None = None
    period: BudgetPeriod | None = None


class BudgetOut(BaseModel):
    id: UUID
    category: TransactionCategory
    amount: float
    period: BudgetPeriod
    created_at: datetime

    class Config:
        from_attributes = True
