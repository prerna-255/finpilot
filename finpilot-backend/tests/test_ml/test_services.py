"""ML services unit tests (no DB required)."""
from datetime import date
from app.ml.services import compute_health_score, detect_anomalies, forecast_expenses, detect_subscriptions


def make_transaction(amount, tx_type, category="other", merchant=None, days_ago=0):
    from app.models.transaction import Transaction, TransactionType, TransactionCategory
    tx = Transaction.__new__(Transaction)
    tx.amount = amount
    tx.type = TransactionType(tx_type)
    tx.category = TransactionCategory(category)
    tx.merchant = merchant
    tx.date = date.today()
    return tx


def test_health_score_empty():
    result = compute_health_score([])
    assert result["score"] == 50
    assert "Not enough data" in result["label"]


def test_health_score_with_data():
    txs = [make_transaction(50000, "income", "salary")] + [
        make_transaction(1000, "expense", "food") for _ in range(10)
    ]
    result = compute_health_score(txs)
    assert 0 <= result["score"] <= 100
    assert "breakdown" in result


def test_anomaly_detection_insufficient_data():
    txs = [make_transaction(1000, "expense") for _ in range(5)]
    result = detect_anomalies(txs)
    assert result == []


def test_forecast_empty():
    result = forecast_expenses([])
    assert result == []


def test_forecast_with_data():
    txs = [make_transaction(5000, "expense", "food") for _ in range(5)]
    result = forecast_expenses(txs, months_ahead=3)
    assert len(result) == 3
    assert all("predicted" in r for r in result)
