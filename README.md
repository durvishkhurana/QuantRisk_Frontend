# QuantRisk Frontend

React single-page application for portfolio management, risk visualization, margin alerts, and embedded API documentation. Talks to the QuantRisk backend over HTTPS and WebSockets.

## Features

- Registration and login with JWT stored client-side
- Dashboard with portfolio cards and aggregate risk summary
- Portfolio detail: positions, VaR/CVaR metrics, stress tests, Monte Carlo, correlation matrix, optimizer, backtest, SHAP waterfall, volatility forecast, risk narrative
- Real-time margin alerts (REST + WebSocket stream replay)
- In-app Swagger UI at `/docs` (JWT-aware)
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
- Running QuantRisk backend (see [backend README](../backend/README.md))

## Configuration

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:8000
```

`VITE_API_URL` must be the backend origin **without** a trailing slash. It is embedded at build time for production static hosting.

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

**Vercel (recommended):** import this repo, set `VITE_API_URL` to your Render backend URL, build command `npm run build`, output directory `dist`. SPA rewrites are in `vercel.json`.

**Render:** optional static site via `render.yaml` in this repo.

After deploy, set the backend `FRONTEND_URL` and `FRONTEND_URLS` to your Vercel URL for CORS.

## Project layout

```
src/
  api/              # Typed API clients (portfolios, risk, alerts)
  api.ts            # Axios instance and auth header helper
  pages/            # Routes: dashboard, portfolio, alerts, auth, docs
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
| `/docs` | Public | Embedded OpenAPI UI |

## CI

`.github/workflows/build.yml` runs `npm ci` and `npm run build` on push to `main`.

## Related documentation

- [System overview](../md/OVERVIEW.md)
- [API reference](../md/api_reference.md)
