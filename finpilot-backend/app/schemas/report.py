from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ReportOut(BaseModel):
    id: UUID
    title: str
    period: str
    summary: str
    generated_at: datetime

    class Config:
        from_attributes = True


class ReportGenerate(BaseModel):
    period: str