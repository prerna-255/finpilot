import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class GoalType(str, enum.Enum):
    emergency_fund = "emergency_fund"
    vacation = "vacation"
    car = "car"
    house = "house"
    education = "education"
    retirement = "retirement"
    gadget = "gadget"
    custom = "custom"


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[GoalType] = mapped_column(Enum(GoalType), default=GoalType.custom)
    target_amount: Mapped[float] = mapped_column(Float, nullable=False)
    current_amount: Mapped[float] = mapped_column(Float, default=0)
    target_date: Mapped[date] = mapped_column(Date, nullable=False)

    # AI-computed fields, refreshed by ml.goal_planner service
    monthly_savings_needed: Mapped[float] = mapped_column(Float, default=0)
    probability: Mapped[int] = mapped_column(Integer, default=50)
    suggestions: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON-encoded list

    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user = relationship("User", back_populates="goals")
