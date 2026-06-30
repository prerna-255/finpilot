import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"
    transfer = "transfer"


class TransactionCategory(str, enum.Enum):
    food = "food"
    transport = "transport"
    shopping = "shopping"
    entertainment = "entertainment"
    utilities = "utilities"
    health = "health"
    education = "education"
    housing = "housing"
    investments = "investments"
    salary = "salary"
    freelance = "freelance"
    subscriptions = "subscriptions"
    travel = "travel"
    other = "other"


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    type: Mapped[TransactionType] = mapped_column(Enum(TransactionType), default=TransactionType.expense)
    category: Mapped[TransactionCategory] = mapped_column(
        Enum(TransactionCategory), default=TransactionCategory.other, index=True
    )
    merchant: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    account: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tags: Mapped[str | None] = mapped_column(String(500), nullable=True)  # comma-separated
    is_anomaly: Mapped[bool] = mapped_column(Boolean, default=False)
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_upload_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("uploaded_files.id"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user = relationship("User", back_populates="transactions")
