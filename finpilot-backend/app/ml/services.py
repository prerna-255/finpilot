"""Lightweight ML services. Designed to degrade gracefully with little data
so the API never 500s on a fresh account — falls back to heuristics when
there isn't enough history for a model to be meaningful.
"""
from __future__ import annotations

from datetime import date, timedelta

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression

from app.models.transaction import Transaction, TransactionType


def transactions_to_df(transactions: list[Transaction]) -> pd.DataFrame:
    if not transactions:
        return pd.DataFrame(columns=["date", "amount", "category", "type", "merchant"])
    return pd.DataFrame(
        [
            {
                "date": t.date,
                "amount": t.amount,
                "category": t.category.value,
                "type": t.type.value,
                "merchant": t.merchant,
            }
            for t in transactions
        ]
    )


def compute_health_score(transactions: list[Transaction]) -> dict:
    df = transactions_to_df(transactions)
    if df.empty:
        return {"score": 50, "label": "Not enough data yet", "breakdown": {}}

    income = df.loc[df["type"] == "income", "amount"].sum()
    expense = df.loc[df["type"] == "expense", "amount"].sum()
    savings_rate = ((income - expense) / income * 100) if income else 0

    # Component scores (0-100 each), weighted average
    savings_score = float(np.clip(savings_rate * 2, 0, 100))  # 50% savings rate -> 100
    diversification = df.loc[df["type"] == "expense", "category"].nunique()
    diversification_score = float(np.clip(diversification * 12, 0, 100))
    volatility = df.loc[df["type"] == "expense", "amount"].std() or 0
    avg_expense = df.loc[df["type"] == "expense", "amount"].mean() or 1
    stability_score = float(np.clip(100 - (volatility / avg_expense * 50), 0, 100))

    score = round(savings_score * 0.5 + diversification_score * 0.2 + stability_score * 0.3)
    label = "Excellent" if score >= 80 else "Good" if score >= 60 else "Needs attention" if score >= 40 else "At risk"

    return {
        "score": int(score),
        "label": label,
        "breakdown": {
            "savings": round(savings_score),
            "diversification": round(diversification_score),
            "stability": round(stability_score),
        },
    }


def detect_anomalies(transactions: list[Transaction]) -> list[dict]:
    df = transactions_to_df(transactions)
    expenses = df[df["type"] == "expense"]
    if len(expenses) < 10:
        return []

    model = IsolationForest(contamination=0.05, random_state=42)
    features = expenses[["amount"]].values
    expenses = expenses.copy()
    expenses["anomaly_score"] = model.fit_predict(features)
    flagged = expenses[expenses["anomaly_score"] == -1]

    results = []
    for idx, row in flagged.iterrows():
        severity = "high" if row["amount"] > expenses["amount"].quantile(0.95) else "medium"
        results.append(
            {
                "index": int(idx),
                "amount": float(row["amount"]),
                "category": row["category"],
                "merchant": row["merchant"],
                "date": row["date"].isoformat() if hasattr(row["date"], "isoformat") else str(row["date"]),
                "severity": severity,
                "reason": f"Unusually high {row['category']} transaction compared to your typical spending",
            }
        )
    return results


def forecast_expenses(transactions: list[Transaction], months_ahead: int = 3) -> list[dict]:
    df = transactions_to_df(transactions)
    expenses = df[df["type"] == "expense"]
    if expenses.empty:
        return []

    expenses = expenses.copy()
    expenses["month"] = pd.to_datetime(expenses["date"]).dt.to_period("M")
    monthly = expenses.groupby("month")["amount"].sum().reset_index()

    if len(monthly) < 3:
        # Not enough history for regression — use flat average projection
        avg = float(monthly["amount"].mean())
        last_month = monthly["month"].max() if not monthly.empty else pd.Period(date.today(), "M")
        return [
            {
                "date": str(last_month + i),
                "predicted": round(avg, 2),
                "lower": round(avg * 0.85, 2),
                "upper": round(avg * 1.15, 2),
            }
            for i in range(1, months_ahead + 1)
        ]

    monthly["t"] = range(len(monthly))
    model = LinearRegression()
    model.fit(monthly[["t"]], monthly["amount"])
    residual_std = float(np.std(monthly["amount"] - model.predict(monthly[["t"]])))

    last_t = monthly["t"].max()
    last_month = monthly["month"].max()
    forecasts = []
    for i in range(1, months_ahead + 1):
        t = last_t + i
        predicted = float(model.predict([[t]])[0])
        forecasts.append(
            {
                "date": str(last_month + i),
                "predicted": round(max(predicted, 0), 2),
                "lower": round(max(predicted - 1.28 * residual_std, 0), 2),
                "upper": round(predicted + 1.28 * residual_std, 2),
            }
        )
    return forecasts


def detect_subscriptions(transactions: list[Transaction]) -> list[dict]:
    df = transactions_to_df(transactions)
    expenses = df[(df["type"] == "expense") & df["merchant"].notna()]
    if expenses.empty:
        return []

    subs = []
    for merchant, group in expenses.groupby("merchant"):
        if len(group) < 2:
            continue
        dates = pd.to_datetime(group["date"]).sort_values()
        gaps = dates.diff().dropna().dt.days
        if gaps.empty:
            continue
        avg_gap = gaps.mean()
        # Recurring monthly-ish charge: 25-35 day gaps, consistent amount
        if 20 <= avg_gap <= 40 and group["amount"].std() < group["amount"].mean() * 0.1:
            last_date = dates.max().date()
            days_since = (date.today() - last_date).days
            subs.append(
                {
                    "merchant": merchant,
                    "amountPerMonth": round(float(group["amount"].mean()), 2),
                    "lastUsedDaysAgo": days_since,
                    "recommendation": "cancel" if days_since > 45 else "keep",
                }
            )
    return subs
