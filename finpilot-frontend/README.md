# FinPilot AI — Frontend

Next.js 14 + TypeScript frontend for the FinPilot AI financial copilot.

## Stack
- **Next.js 14** App Router
- **TypeScript** + Zod validation
- **Tailwind CSS** + Radix UI primitives
- **Framer Motion** animations
- **Recharts** data visualization
- **TanStack Query** server state
- **Zustand** client state

## Quick Start

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:3000

## Pages

| Route | Description |
|-------|-------------|
| / | Landing page |
| /auth/login | Login |
| /auth/register | Register |
| /dashboard | Overview with charts |
| /dashboard/transactions | Transaction list |
| /dashboard/analytics | Detailed analytics |
| /dashboard/budgets | Budget management |
| /dashboard/goals | Financial goals |
| /dashboard/insights | AI insights + anomalies |
| /dashboard/chat | AI copilot chat |
| /dashboard/upload | Statement import |
| /dashboard/reports | Reports |
| /dashboard/settings | User settings |
