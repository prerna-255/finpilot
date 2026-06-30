from fastapi import APIRouter
from app.api.v1.routes import auth, transactions, analytics, ml, goals, budgets, uploads, notifications, chat, insights, users
from app.api.v1.routes import reports
api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(transactions.router)
api_router.include_router(analytics.router)
api_router.include_router(ml.router)
api_router.include_router(goals.router)
api_router.include_router(budgets.router)
api_router.include_router(uploads.router)
api_router.include_router(notifications.router)
api_router.include_router(chat.router)
api_router.include_router(insights.router)
api_router.include_router(users.router)
api_router.include_router(reports.router)
