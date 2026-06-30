"""AI Chat endpoint using Anthropic Claude with user financial context."""
from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import google.generativeai as genai
import json

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.chat import ChatMessage, ChatSession
from app.models.transaction import Transaction
from app.models.user import User
from app.ml.services import compute_health_score, transactions_to_df
from app.ml.insights import generate_insights

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str


async def _build_financial_context(user: User, db: AsyncSession) -> str:
    result = await db.execute(select(Transaction).where(Transaction.user_id == user.id).limit(500))
    transactions = list(result.scalars().all())
    if not transactions:
        return "The user has no transaction data uploaded yet."

    df = transactions_to_df(transactions)
    income = df[df["type"] == "income"]["amount"].sum()
    expenses = df[df["type"] == "expense"]["amount"].sum()
    health = compute_health_score(transactions)
    insights = generate_insights(transactions)
    top_categories = df[df["type"] == "expense"].groupby("category")["amount"].sum().nlargest(5).to_dict()

    ctx = f"""User: {user.name}
Total Income: ₹{income:,.2f}
Total Expenses: ₹{expenses:,.2f}
Net Savings: ₹{income - expenses:,.2f}
Savings Rate: {((income - expenses) / income * 100) if income else 0:.1f}%
Financial Health Score: {health['score']}/100 ({health['label']})
Top Spending Categories: {json.dumps({k: f'₹{v:,.2f}' for k, v in top_categories.items()})}
Recent Insights: {json.dumps([i['message'] for i in insights[:3]])}
Transaction Count: {len(transactions)}"""
    return ctx


@router.get("/sessions")
async def list_sessions(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatSession).where(ChatSession.user_id == user.id).order_by(ChatSession.updated_at.desc()).limit(20)
    )
    sessions = result.scalars().all()
    return [{"id": str(s.id), "title": s.title, "created_at": s.created_at.isoformat()} for s in sessions]


@router.post("/sessions")
async def create_session(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    session = ChatSession(user_id=user.id, title="New chat")
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return {"id": str(session.id), "title": session.title}


@router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatMessage)
        .join(ChatSession)
        .where(ChatSession.id == session_id, ChatSession.user_id == user.id)
        .order_by(ChatMessage.created_at)
    )
    msgs = result.scalars().all()
    return [{"role": m.role, "content": m.content, "created_at": m.created_at.isoformat()} for m in msgs]


@router.post("/")
async def chat(
    payload: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")

    # Get or create session
    if payload.session_id:
        result = await db.execute(
            select(ChatSession).where(ChatSession.id == payload.session_id, ChatSession.user_id == user.id)
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        session = ChatSession(user_id=user.id, title=payload.message[:50])
        db.add(session)
        await db.commit()
        await db.refresh(session)

    # Get history
    hist_result = await db.execute(
        select(ChatMessage).where(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at).limit(20)
    )
    history = hist_result.scalars().all()

    # Build context
    financial_context = await _build_financial_context(user, db)

    system_prompt = f"""You are FinPilot AI, an expert financial copilot. You help users understand their finances using ONLY their actual data.

FINANCIAL DATA:
{financial_context}

Rules:
- Answer only about the user's finances using the data above
- Be specific with numbers when available
- Give actionable advice
- Format responses with markdown for clarity
- Be encouraging but honest about financial challenges
- If asked about something outside finance, gently redirect"""

    messages = [{"role": m.role, "content": m.content} for m in history]
    messages.append({"role": "user", "content": payload.message})

    # Save user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=payload.message)
    db.add(user_msg)
    await db.commit()
    await db.refresh(user_msg)

    # Call Anthropic
    print("Gemini key loaded:", settings.GEMINI_API_KEY[:20] if settings.GEMINI_API_KEY else "None")
    genai.configure(api_key=settings.GEMINI_API_KEY)

    model = genai.GenerativeModel("gemini-2.5-flash")

    try:
        prompt = f"""
            {system_prompt}

        Conversation History:
        {json.dumps(messages)}

        User:
        {payload.message}
        """

        response = model.generate_content(prompt)

        full_response = response.text

        assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=full_response,
        )

        db.add(assistant_msg)

        if len(history) == 0:
            session.title = payload.message[:60]

        await db.commit()

        return {
        "session_id": str(session.id),
        "response": full_response,
        }

    except Exception as e:
        await db.rollback()
    raise HTTPException(status_code=500, detail=str(e))