# FinPilot AI — Backend

FastAPI-powered financial analytics backend with ML, AI chat, and multi-format statement parsing.

## Stack
- **FastAPI** + asyncpg (async PostgreSQL)
- **SQLAlchemy 2.0** async ORM + Alembic migrations
- **scikit-learn** for anomaly detection, forecasting, health scoring
- **Anthropic Claude** for AI chat copilot
- **pdfplumber / pandas / openpyxl** for statement parsing
- **Redis** for caching (future)
- **S3 / MinIO** for file storage

## Quick Start

```bash
# 1. Copy env
cp .env.example .env
# 2. Edit .env with your keys

# 3. Docker (recommended)
docker compose up -d

# 4. Run migrations
docker compose exec backend alembic upgrade head
```

Or locally:
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs at: http://localhost:8000/docs

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/auth/register | Register |
| POST | /api/v1/auth/login | Login |
| GET | /api/v1/transactions | List transactions |
| POST | /api/v1/uploads | Upload bank statement |
| GET | /api/v1/analytics/summary | Dashboard summary |
| GET | /api/v1/ml/health-score | Financial health score |
| GET | /api/v1/ml/forecast | Expense forecast |
| GET | /api/v1/ml/anomalies | Anomaly detection |
| GET | /api/v1/ml/subscriptions | Subscription detection |
| POST | /api/v1/chat/ | AI chat (streaming SSE) |
| GET | /api/v1/insights | Auto-generated insights |
| GET | /api/v1/goals | Financial goals |
| GET | /api/v1/budgets | Budget limits |
| GET | /api/v1/notifications | Notifications |

## Project Structure

```
app/
├── core/          # Config, DB, security, deps
├── models/        # SQLAlchemy ORM models
├── schemas/       # Pydantic request/response schemas
├── api/v1/routes/ # FastAPI route handlers
├── services/      # Business logic (storage, parser)
└── ml/            # ML services (health, forecast, anomalies)
```
