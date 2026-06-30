"""Auto-generate human-readable financial insights from transaction data."""
from __future__ import annotations
from datetime import date, timedelta
import pandas as pd
from app.models.transaction import Transaction
from app.ml.services import transactions_to_df


def generate_insights(transactions: list[Transaction]) -> list[dict]:
    df = transactions_to_df(transactions)
    if df.empty:
        return []

    df["date"] = pd.to_datetime(df["date"])
    insights = []
    today = pd.Timestamp(date.today())
    this_month = df[df["date"].dt.month == today.month]
    last_month = df[df["date"].dt.month == (today - timedelta(days=30)).month]

    # Food spending change
    food_this = this_month[this_month["category"] == "food"]["amount"].sum()
    food_last = last_month[last_month["category"] == "food"]["amount"].sum()
    if food_last > 0 and food_this > 0:
        change = ((food_this - food_last) / food_last) * 100
        if abs(change) > 10:
            direction = "more" if change > 0 else "less"
            insights.append({
                "type": "spending_change",
                "title": f"Food spending {direction}",
                "message": f"You spent {abs(change):.0f}% {direction} on food this month compared to last month.",
                "severity": "warning" if change > 20 else "info",
                "icon": "🍽️",
            })

    # Top spending category
    expenses = df[df["type"] == "expense"]
    if not expenses.empty:
        top_cat = expenses.groupby("category")["amount"].sum().idxmax()
        top_amt = expenses.groupby("category")["amount"].sum().max()
        total_expense = expenses["amount"].sum()
        pct = (top_amt / total_expense * 100) if total_expense > 0 else 0
        insights.append({
            "type": "top_category",
            "title": f"Top spending: {top_cat.title()}",
            "message": f"{top_cat.title()} accounts for {pct:.0f}% of your total spending.",
            "severity": "info",
            "icon": "📊",
        })

    # Savings rate
    income = df[df["type"] == "income"]["amount"].sum()
    expense_total = df[df["type"] == "expense"]["amount"].sum()
    if income > 0:
        savings_rate = ((income - expense_total) / income) * 100
        if savings_rate < 20:
            insights.append({
                "type": "savings_alert",
                "title": "Low savings rate",
                "message": f"Your savings rate is {savings_rate:.0f}%. Aim for at least 20% to build financial security.",
                "severity": "warning",
                "icon": "⚠️",
            })
        else:
            insights.append({
                "type": "savings_positive",
                "title": "Great savings rate!",
                "message": f"You're saving {savings_rate:.0f}% of your income. Keep it up!",
                "severity": "success",
                "icon": "🎉",
            })

    return insights
