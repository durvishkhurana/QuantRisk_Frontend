import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import { getBacktest } from "../../api/risk";

type Props = { portfolioId: string; days?: number };

export const BacktestPanel = ({ portfolioId, days = 252 }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["backtest", portfolioId, days],
    queryFn: () => getBacktest(portfolioId, days),
    enabled: Boolean(portfolioId),
  });

  if (isLoading) return <p className="muted">Running Kupiec backtest…</p>;
  if (!data) return <p className="muted">No backtest data.</p>;

  const chartData = data.series.map((p) => ({
    date: p.date,
    var_95: Number(p.var_95),
    violated: p.violated,
  }));
  const violations = chartData.filter((p) => p.violated);

  return (
    <div className="card">
      <h3>VaR Model Validation (Kupiec Test)</h3>
      <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
        <span
          className={`status-badge ${
            data.model_valid === true ? "ok" : data.model_valid === false ? "bad" : ""
          }`}
        >
          {data.model_valid === true
            ? "MODEL VALID"
            : data.model_valid === false
              ? "MODEL INVALID"
              : "MODEL UNDEFINED"}
        </span>
        <span className="badge">{data.calibration.replace(/_/g, " ")}</span>
      </div>
      <div className="stat-badges">
        <span className="badge">
          Expected violations: <strong className="mono">{data.expected_violations}</strong>
        </span>
        <span className="badge">
          Actual violations: <strong className="mono">{data.actual_violations}</strong>
        </span>
        <span className="badge">
          Violation rate: <strong className="mono">{(data.violation_rate * 100).toFixed(2)}%</strong>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#1f1f2e" />
          <XAxis dataKey="date" tick={{ fill: "#9aa0b5", fontSize: 10 }} minTickGap={24} />
          <YAxis tick={{ fill: "#9aa0b5", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#0f1923", border: "1px solid #2a2a3d" }} />
          <Line type="monotone" dataKey="var_95" stroke="#00FF87" dot={false} strokeWidth={2} />
          <Scatter data={violations} fill="#FF4444" />
        </LineChart>
      </ResponsiveContainer>
      {data.message ? <p className="muted small">{data.message}</p> : null}
      <p className="muted small">
        A valid model at 95% confidence should have losses exceed VaR roughly 5% of days (≈12–13 times per year). More
        violations means the model is underestimating risk.
      </p>
    </div>
  );
};
