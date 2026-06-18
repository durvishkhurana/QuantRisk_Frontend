import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import { getBacktest } from "../../api/risk";
import { cn } from "../../lib/utils";

type Props = { portfolioId: string; days?: number };

export const BacktestPanel = ({ portfolioId, days = 252 }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["backtest", portfolioId, days],
    queryFn: () => getBacktest(portfolioId, days),
    enabled: Boolean(portfolioId),
  });

  if (isLoading) return <p className="text-text-muted text-xs">Running model calibration (Kupiec LR test)…</p>;
  if (!data) return <p className="text-text-muted text-xs">No model validation metrics available.</p>;

  const chartData = data.series.map((p) => ({
    date: p.date,
    var_95: Number(p.var_95),
    violated: p.violated,
  }));
  const violations = chartData.filter((p) => p.violated);

  const isValid = data.model_valid === true;
  const statusClass = cn(
    "px-2.5 py-1 rounded text-[10px] font-bold tracking-wider font-mono border uppercase",
    isValid
      ? "text-accent-green bg-accent-green/10 border-accent-green/20"
      : "text-danger bg-danger/10 border-danger/20"
  );

  return (
    <div className="terminal-card p-5 space-y-4 shadow-lg shadow-black/25">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-bold text-text-primary">VaR Model Validation (Kupiec Test)</h3>
          <p className="text-text-muted text-[10px] uppercase tracking-wider mt-1">Calibrating historical simulations vs actual exceptions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={statusClass}>
            {data.model_valid === true
              ? "MODEL VALID"
              : data.model_valid === false
                ? "MODEL INVALID"
                : "MODEL UNDEFINED"}
          </span>
          <span className="px-2 py-0.5 rounded border border-white/[0.04] bg-white/[0.01] text-[10px] font-mono text-text-secondary uppercase">
            {data.calibration.replace(/_/g, " ")}
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 text-[10px] font-mono text-text-secondary">
        <span className="px-2 py-0.5 rounded border border-white/[0.04] bg-white/[0.01]">
          Expected violations: <strong className="text-text-primary">{data.expected_violations}</strong>
        </span>
        <span className="px-2 py-0.5 rounded border border-white/[0.04] bg-white/[0.01]">
          Actual violations: <strong className="text-text-primary">{data.actual_violations}</strong>
        </span>
        <span className="px-2 py-0.5 rounded border border-white/[0.04] bg-white/[0.01]">
          Exception rate: <strong className="text-text-primary">{(data.violation_rate * 100).toFixed(2)}%</strong>
        </span>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: 0, right: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" horizontal vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 9 }} minTickGap={30} />
            <YAxis tick={{ fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono" }} tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} />
            <Tooltip contentStyle={{ background: "#0a0e14", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "4px" }} />
            <Line type="monotone" dataKey="var_95" stroke="#dfc399" dot={false} strokeWidth={1.5} />
            <Scatter data={violations} fill="#dc2626" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {data.message ? <p className="text-[10px] text-text-muted leading-relaxed font-sans">{data.message}</p> : null}
      
      <p className="text-[10px] text-text-muted leading-relaxed font-sans bg-[#05070c]/50 p-3 rounded border border-white/[0.02]">
        A valid model at 95% confidence should have losses exceed VaR roughly 5% of days (≈12–13 times per year). More
        violations means the model is underestimating risk.
      </p>
    </div>
  );
};
