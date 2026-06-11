import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api";

type VolForecast = {
  ticker: string;
  predicted_vol: number;
  garch_vol: number;
  lstm_mae: number;
  garch_mae: number;
  improvement_pct?: number | null;
  vol_regime: string;
  adjusted_var_95?: number | null;
  lstm_rmse?: number;
  garch_rmse?: number;
  direction_accuracy?: number;
  history?: { computed_at: string; predicted_vol: number; garch_vol: number }[];
};

type Props = {
  portfolioId: string;
  historicalVar95?: number;
  volForecasts?: VolForecast[] | null;
  adjustedVar95Portfolio?: number | null;
};

const regimeClass: Record<string, string> = {
  LOW: "bg-accent-green/20 text-accent-green border-accent-green/40",
  MEDIUM: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  HIGH: "bg-red-500/20 text-red-400 border-red-500/40",
};

export const VolatilityForecastPanel = ({
  portfolioId,
  historicalVar95,
  volForecasts,
  adjustedVar95Portfolio,
}: Props) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const detail = useQuery({
    queryKey: ["vol-forecast", portfolioId],
    queryFn: async () =>
      (await api.get(`/portfolios/${portfolioId}/risk/volatility-forecast`)).data as VolForecast[],
    enabled: Boolean(portfolioId) && !volForecasts?.length,
    retry: false,
  });

  const rows = volForecasts?.length ? volForecasts : detail.data ?? [];
  const historyByTicker = useMemo(() => {
    const map = new Map<string, VolForecast["history"]>();
    for (const r of detail.data ?? []) {
      map.set(r.ticker, r.history);
    }
    return map;
  }, [detail.data]);

  if (!rows.length) {
    return (
      <div className="terminal-card p-4">
        <h3 className="text-text-primary font-semibold">Volatility Forecast (LSTM vs GARCH)</h3>
        <p className="text-text-secondary text-sm mt-1">LSTM-predicted volatility vs GARCH(1,1) baseline</p>
        <p className="muted text-sm mt-3">Run a risk computation to generate volatility forecasts.</p>
      </div>
    );
  }

  const histVar = historicalVar95 ?? 0;
  const adjPort = adjustedVar95Portfolio ?? rows.reduce((s, r) => s + (r.adjusted_var_95 ?? 0), 0) / rows.length;
  const diff = adjPort - histVar;

  return (
    <div className="terminal-card p-4 space-y-3">
      <div>
        <h3 className="text-text-primary font-semibold">Volatility Forecast (LSTM vs GARCH)</h3>
        <p className="text-text-secondary text-sm">LSTM-predicted volatility vs GARCH(1,1) baseline</p>
      </div>

      <div className="divide-y divide-border">
        {rows.map((row) => {
          const imp = row.improvement_pct ?? 0;
          const better = imp >= 0;
          const isOpen = expanded === row.ticker;
          const chartData =
            historyByTicker.get(row.ticker)?.map((h) => ({
              date: new Date(h.computed_at).toLocaleDateString(),
              lstm: h.predicted_vol * 100,
              garch: h.garch_vol * 100,
            })) ?? [];

          return (
            <div key={row.ticker} className="py-2">
              <button
                type="button"
                className="w-full text-left grid grid-cols-[auto_1fr_auto] gap-3 items-center hover:bg-bg-secondary/40 rounded px-1 py-1"
                onClick={() => setExpanded(isOpen ? null : row.ticker)}
              >
                <span className="font-mono font-semibold text-text-primary">{row.ticker}</span>
                <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                  <span className={`px-2 py-0.5 rounded border ${regimeClass[row.vol_regime] ?? regimeClass.MEDIUM}`}>
                    {row.vol_regime}
                  </span>
                  <span>
                    LSTM: <strong className="text-text-primary">{(row.predicted_vol * 100).toFixed(2)}%</strong>
                  </span>
                  <span>
                    GARCH: <strong className="text-text-primary">{(row.garch_vol * 100).toFixed(2)}%</strong>
                  </span>
                  <span className={better ? "text-accent-green" : "text-red-400"}>
                    {better ? "+" : ""}
                    {imp.toFixed(1)}% vs GARCH
                  </span>
                  <span
                    title="Historical VaR scaled by predicted/historical vol ratio"
                    className="text-text-secondary"
                  >
                    Adj. VaR:{" "}
                    <strong className="text-text-primary">
                      ${Math.round(row.adjusted_var_95 ?? 0).toLocaleString()}
                    </strong>
                  </span>
                </div>
                <span className="text-text-secondary text-xs">{isOpen ? "▲" : "▼"}</span>
              </button>
              <AnimatePresence>
                {isOpen && chartData.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 220, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-2"
                  >
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid stroke="#1f1f2e" />
                        <XAxis dataKey="date" tick={{ fill: "#9aa0b5", fontSize: 10 }} />
                        <YAxis tick={{ fill: "#9aa0b5", fontSize: 11 }} unit="%" />
                        <Tooltip contentStyle={{ background: "#0f1923", border: "1px solid #2a2a3d" }} />
                        <Line type="monotone" dataKey="lstm" stroke="#00FF87" dot={false} name="LSTM" />
                        <Line type="monotone" dataKey="garch" stroke="#6b7cff" dot={false} name="GARCH" />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border text-sm">
        <span className="text-text-secondary">
          Portfolio adjusted VaR (95%):{" "}
          <strong className="text-text-primary font-mono">${Math.round(adjPort).toLocaleString()}</strong>
          {" vs "}
          historical VaR{" "}
          <strong className="text-text-primary font-mono">${Math.round(histVar).toLocaleString()}</strong>
        </span>
        <span
          className={`px-2 py-0.5 rounded text-xs font-mono ${
            diff > 0 ? "bg-red-500/20 text-red-400" : "bg-accent-green/20 text-accent-green"
          }`}
        >
          {diff > 0 ? "+" : ""}
          ${Math.round(diff).toLocaleString()}
        </span>
      </div>
    </div>
  );
};
