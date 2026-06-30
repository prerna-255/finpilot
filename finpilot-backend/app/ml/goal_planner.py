"""Goal achievement probability and monthly savings calculator."""
from __future__ import annotations
import json
from datetime import date
from app.models.goal import Goal
from app.models.transaction import Transaction
from app.ml.services import compute_health_score, transactions_to_df


def compute_goal_plan(goal: Goal, transactions: list[Transaction]) -> dict:
    today = date.today()
    months_left = max(1, (goal.target_date.year - today.year) * 12 + (goal.target_date.month - today.month))
    remaining = goal.target_amount - goal.current_amount
    monthly_needed = remaining / months_left

    df = transactions_to_df(transactions)
    if not df.empty:
        income = df.loc[df["type"] == "income", "amount"].sum()
        expense = df.loc[df["type"] == "expense", "amount"].sum()
        avg_monthly_income = income / max(1, df["date"].nunique() / 30)
        avg_monthly_expense = expense / max(1, df["date"].nunique() / 30)
        avg_monthly_savings = avg_monthly_income - avg_monthly_expense
    else:
        avg_monthly_savings = 0

    if avg_monthly_savings >= monthly_needed:
        probability = min(95, int(70 + (avg_monthly_savings / monthly_needed) * 25))
    else:
        probability = max(5, int((avg_monthly_savings / monthly_needed) * 70)) if monthly_needed > 0 else 50

    suggestions = []
    if avg_monthly_savings < monthly_needed:
        gap = monthly_needed - avg_monthly_savings
        suggestions.append(f"You need ₹{gap:,.0f} more in monthly savings to meet this goal on time.")
        suggestions.append("Consider reducing discretionary spending on dining or subscriptions.")
        suggestions.append("A side income of ₹{gap/2:,.0f}/month could bridge the gap.")
    else:
        surplus = avg_monthly_savings - monthly_needed
        suggestions.append(f"You're on track! You have ₹{surplus:,.0f}/month surplus.")
        suggestions.append("Consider investing the surplus in a high-yield savings account.")

    return {
        "monthly_savings_needed": round(monthly_needed, 2),
        "probability": probability,
        "suggestions": json.dumps(suggestions),
    }
