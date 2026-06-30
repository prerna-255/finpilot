import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.transaction import TransactionCategory


class BudgetPeriod(str, enum.Enum):
    weekly = "weekly"
    monthly = "monthly"
    annual = "annual"


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    category: Mapped[TransactionCategory] = mapped_column(Enum(TransactionCategory), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    period: Mapped[BudgetPeriod] = mapped_column(Enum(BudgetPeriod), default=BudgetPeriod.monthly)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )
    user = relationship("User", back_populates="budgets")
