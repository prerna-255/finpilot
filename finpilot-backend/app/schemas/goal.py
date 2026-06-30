import json
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, field_validator
from app.models.goal import GoalType


class GoalCreate(BaseModel):
    name: str
    type: GoalType
    target_amount: float
    current_amount: float = 0
    target_date: date


class GoalDeposit(BaseModel):
    amount: float

def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])

class GoalOut(BaseModel):
    id: UUID
    name: str
    type: GoalType
    target_amount: float
    current_amount: float
    target_date: date
    monthly_savings_needed: float
    probability: int
    suggestions: list[str] = []
    is_completed: bool
    created_at: datetime

    @field_validator("suggestions", mode="before")
    @classmethod
    def parse_suggestions(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        return v or []

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
        "alias_generator": to_camel,
    }
