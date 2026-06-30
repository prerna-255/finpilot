# FinPilot AI

> AI-powered financial analytics platform — upload bank statements, get insights, chat with your finances.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Setup

```bash
# 1. Clone
git clone <repo>

# 2. Configure backend
cp finpilot-backend/.env.example finpilot-backend/.env
# Add your ANTHROPIC_API_KEY

# 3. Configure frontend
cp finpilot-frontend/.env.example finpilot-frontend/.env.local

# 4. Start everything
cd finpilot
docker compose up -d

# 5. Run DB migrations
docker compose exec backend alembic upgrade head
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Features
- 📊 **Interactive Dashboard** — Income, expenses, savings, health score
- 🤖 **AI Copilot** — Chat with Claude about your finances
- 📁 **Statement Import** — CSV, Excel, PDF bank statements
- 🔍 **Anomaly Detection** — ML-powered unusual transaction alerts
- 📈 **Expense Forecasting** — Predict next month's spending
- 🎯 **Goal Planner** — Track savings goals with AI probability scoring
- 💰 **Budget Tracking** — Set and monitor spending limits
- 💡 **Auto Insights** — Personalized financial recommendations
- 🔔 **Smart Notifications** — Budget alerts and savings milestones

## Architecture

```
finpilot/
├── finpilot-backend/     # FastAPI + PostgreSQL + ML
│   ├── app/
│   │   ├── api/v1/routes/  # Auth, transactions, analytics, ML, chat...
│   │   ├── models/         # SQLAlchemy ORM (User, Transaction, Goal...)
│   │   ├── ml/             # Health score, forecasting, anomaly detection
│   │   └── services/       # S3 storage, statement parser
│   └── alembic/            # DB migrations
└── finpilot-frontend/    # Next.js 14 + TypeScript
    └── src/
        ├── app/dashboard/  # All dashboard pages
        ├── components/     # Reusable UI components
        ├── lib/            # API client, utilities
        └── store/          # Zustand auth state
```
