# QuantRisk Frontend

React single-page application for portfolio management, risk visualization, and margin alerts. Talks to the QuantRisk backend over HTTPS and WebSockets.

> This is its **own git repository**, deployed independently to Vercel. The sibling
> `backend/` is a separate repo (Render). There is no root-level monorepo. The
> WebSocket carries the stored JWT as a `token` query param for authentication.

## Features

- Registration and login with JWT stored client-side
- Dashboard with portfolio cards and aggregate risk summary
- Portfolio detail: positions, VaR/CVaR metrics, stress tests, Monte Carlo, correlation matrix, optimizer, backtest, SHAP waterfall, volatility forecast, risk narrative
- Real-time margin alerts (REST + WebSocket stream replay)
- Responsive layout with Tailwind CSS and Recharts

## Stack

| Layer | Technology |
|-------|------------|
| UI | React 18, TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS |
| Data | TanStack React Query, Axios, Zustand |
| Charts | Recharts |

## Prerequisites

- Node.js 20+
- Running QuantRisk backend API

## Configuration

**Do not commit `.env` or production API URLs with secrets.**

Copy `.env.example` to `.env` and set:

- `VITE_API_URL` — backend origin (no trailing slash). This is the only variable the app needs.

Vite embeds it at build time for production. Authentication is JWT against the backend (`/auth/*`); the frontend does **not** use Supabase. The WebSocket carries the stored JWT as a `token` query param.

## Local development

```bash
npm install
npm run dev
```

App: `http://localhost:5173`

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve production build locally |

## Deployment

**Vercel:** import this repository, set `VITE_API_URL` in project environment variables, build command `npm run build`, output directory `dist`. SPA rewrites are in `vercel.json`.

**Render:** optional static site via `render.yaml`.

After deploy, set the backend `FRONTEND_URL` and `FRONTEND_URLS` to your frontend URL for CORS.

## Project layout

```
src/
  api/              # Typed API clients (portfolios, risk, alerts)
  api.ts            # Axios instance and auth header helper
  pages/            # Routes: dashboard, portfolio, alerts, auth
  components/       # Risk panels, layout, alerts feed
  hooks/            # Risk polling and WebSocket margin alerts
```

## Routes

| Path | Access | Purpose |
|------|--------|---------|
| `/` | Public | Landing |
| `/auth` | Public | Login / register |
| `/dashboard` | Auth | Portfolio list |
| `/aggregate` | Auth | Cross-portfolio summary |
| `/portfolio/:id` | Auth | Risk workspace |
| `/alerts` | Auth | Margin events |

## API documentation

The backend still exposes OpenAPI at `{API_URL}/api/docs` on Render if you need to inspect endpoints directly.

## CI

`.github/workflows/build.yml` runs `npm ci` and `npm run build` on push to `main`.
