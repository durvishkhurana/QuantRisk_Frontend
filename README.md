<div align="center">

# QuantRisk Engine — Frontend

**Institutional‑style portfolio risk dashboard.**
Live VaR, stress, attribution, volatility, and margin alerts — in a dark "terminal" UI.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Query](https://img.shields.io/badge/React%20Query-5-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query)

</div>

---

## Overview

The web client for **QuantRisk Engine** — a React + Vite + TypeScript single‑page app
that visualizes portfolio risk in real time. It authenticates with JWT, polls the REST
API with TanStack Query, and subscribes to a JWT‑authenticated WebSocket for live alerts.

Backend lives in a separate repo: **[QuantRisk_Backend](https://github.com/durvishkhurana/QuantRisk_Backend)**.

**Live app:** https://quant-risk-frontend.vercel.app

## Features

- **JWT auth** (register/login); token stored client‑side, attached to API + WebSocket
- **Dashboard** — portfolio cards with value, VaR, and margin‑utilization bars
- **Portfolio detail** — VaR cards, margin gauge, SHAP waterfall, VaR‑trend chart,
  Monte Carlo histogram, stress panel, correlation heatmap, optimizer, Kupiec backtest,
  volatility‑forecast panel, and an optional AI risk narrative
- **Inline editing** — add / edit / delete positions; edit portfolio name & margin limit
- **Aggregate view** — firm‑level value and VaR across portfolios
- **Alerts** — live ticker, filters, pagination, CSV export, acknowledge, expandable
  risk snapshot; WebSocket auto‑reconnect with stream resume
- **Staleness banner** when the last computation is older than 5 minutes

## Tech stack

React 18 · Vite 5 · TypeScript 5 · TanStack React Query · Axios · Zustand ·
React Router 6 · Recharts · Framer Motion · TailwindCSS 3 · react‑hot‑toast.

## Project structure

```
src/
├── main.tsx, App.tsx     # entry + routes
├── api.ts, api/          # Axios instance + typed API calls
├── store.ts              # Zustand auth store (JWT in localStorage)
├── lib/                  # API/WebSocket base URL resolver, utils
├── hooks/                # usePortfolioRisk, useMarginAlerts (authed WS w/ resume)
├── pages/                # Landing, Auth, Dashboard, PortfolioDetail, AggregateView, Alerts
└── components/           # layout, portfolio, risk panels, alerts, ui primitives
```

## Quick start

```bash
cp .env.example .env      # set VITE_API_URL=http://localhost:8000
npm install
npm run dev               # http://localhost:5173
```

Build / preview:

```bash
npm run build
npm run preview
```

## Configuration

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend origin (no trailing slash). **The only variable required.** |

Authentication is pure JWT against the backend (`/auth/*`); the frontend does **not**
use Supabase. The WebSocket carries the stored JWT as a `token` query param. `.env` is
gitignored — never commit it.

## Deployment (Vercel)

Set `VITE_API_URL` to the backend origin (Vite bakes it in at build time) and deploy.
SPA routing is handled by `vercel.json`. A `render.yaml` is also provided if hosting the
static build on Render instead.

## License

Educational / portfolio project by Durvish Khurana.
