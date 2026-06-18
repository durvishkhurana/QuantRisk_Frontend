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
import { cn } from "../../lib/utils";

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
  LOW: "bg-accent-green/10 text-accent-green border-accent-green/20",
  MEDIUM: "bg-warning/10 text-warning border-warning/20",
  HIGH: "bg-danger/10 text-danger border-danger/20",
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
      <div className="terminal-card p-5 space-y-2">
        <h3 className="text-xs uppercase tracking-wider font-bold text-text-primary">Volatility Forecast (LSTM vs GARCH)</h3>
        <p className="text-text-muted text-[10px] uppercase tracking-wider mt-1">LSTM-predicted volatility vs GARCH(1,1) baseline</p>
        <p className="text-text-muted text-xs font-sans pt-4">Run a risk computation to generate volatility forecasts.</p>
      </div>
    );
  }

  const histVar = historicalVar95 ?? 0;
  const adjPort = adjustedVar95Portfolio ?? rows.reduce((s, r) => s + (r.adjusted_var_95 ?? 0), 0) / rows.length;
  const diff = adjPort - histVar;

  return (
    <div className="terminal-card p-5 space-y-4 shadow-lg shadow-black/25">
      <div>
        <h3 className="text-xs uppercase tracking-wider font-bold text-text-primary">Volatility Forecast (LSTM vs GARCH)</h3>
        <p className="text-text-muted text-[10px] uppercase tracking-wider mt-1">Deep LSTM predictive modeling vs GARCH(1,1) conditional volatility</p>
      </div>

      <div className="divide-y divide-white/[0.04] border-t border-b border-white/[0.04]">
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
            <div key={row.ticker} className="py-3 font-sans text-xs">
              <button
                type="button"
                className="w-full text-left grid grid-cols-[auto_1fr_auto] gap-4 items-center hover:bg-bg-tertiary/25 rounded px-2 py-1 transition-colors"
                onClick={() => setExpanded(isOpen ? null : row.ticker)}
              >
                <span className="font-mono font-bold text-text-primary text-sm tracking-wider">{row.ticker}</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-secondary">
                  <span className={cn("px-2 py-0.5 rounded border text-[9px] font-bold tracking-wider font-mono uppercase", regimeClass[row.vol_regime] ?? regimeClass.MEDIUM)}>
                    {row.vol_regime} vol
                  </span>
                  <span>
                    LSTM: <strong className="text-text-primary font-mono font-semibold">{(row.predicted_vol * 100).toFixed(2)}%</strong>
                  </span>
                  <span>
                    GARCH: <strong className="text-text-primary font-mono font-semibold">{(row.garch_vol * 100).toFixed(2)}%</strong>
                  </span>
                  <span className={cn("font-semibold", better ? "text-accent-green" : "text-danger")}>
                    {better ? "Improvement" : "Risk Deviation"}: {imp.toFixed(1)}%
                  </span>
                  <span
                    title="Historical VaR scaled by predicted/historical vol ratio"
                    className="text-text-muted"
                  >
                    Adjusted VaR:{" "}
                    <strong className="text-accent-gold font-mono font-bold">
                      ${Math.round(row.adjusted_var_95 ?? 0).toLocaleString()}
                    </strong>
                  </span>
                </div>
                <span className="text-text-muted text-[10px]">
                  {isOpen ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </span>
              </button>
              <AnimatePresence>
                {isOpen && chartData.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 210, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3"
                  >
                    <ResponsiveContainer width="100%" height={190}>
                      <LineChart data={chartData} margin={{ left: -15, right: 10 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 9 }} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono" }} unit="%" />
                        <Tooltip contentStyle={{ background: "#0a0e14", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "4px" }} />
                        <Line type="monotone" dataKey="lstm" stroke="#dfc399" strokeWidth={1.5} dot={false} name="LSTM Predicted" />
                        <Line type="monotone" dataKey="garch" stroke="#2563eb" strokeWidth={1.5} dot={false} name="GARCH Conditional" />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        <span className="text-text-secondary leading-relaxed font-sans">
          Aggregate Volatility-Adjusted VaR (95%):{" "}
          <strong className="text-accent-gold font-mono font-bold">${Math.round(adjPort).toLocaleString()}</strong>
          {" vs "}
          Historical VaR{" "}
          <strong className="text-text-primary font-mono font-semibold">${Math.round(histVar).toLocaleString()}</strong>
        </span>
        <span
          className={cn(
            "px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider",
            diff > 0 ? "bg-danger/10 text-danger border-danger/20" : "bg-accent-green/10 text-accent-green border-accent-green/20"
          )}
        >
          {diff > 0 ? "+" : ""}
          ${Math.round(diff).toLocaleString()} adjustment
        </span>
      </div>
    </div>
  );
};
