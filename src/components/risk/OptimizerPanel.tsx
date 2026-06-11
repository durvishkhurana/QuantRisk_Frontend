import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Scatter, ScatterChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { getOptimization, type OptimizationResult } from "../../api/risk";

type Props = { portfolioId: string };

const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;
const fmtMoney = (v: number) => `$${Math.round(v).toLocaleString()}`;

export const OptimizerPanel = ({ portfolioId }: Props) => {
  const [view, setView] = useState<"current" | "optimized">("current");
  const { data, isLoading, error } = useQuery({
    queryKey: ["optimize", portfolioId],
    queryFn: () => getOptimization(portfolioId),
    enabled: Boolean(portfolioId),
  });

  const frontier = useMemo(
    () =>
      (data?.efficient_frontier ?? []).map((p) => ({
        variance: p.min_variance,
        target_return: p.target_return,
      })),
    [data],
  );

  if (isLoading) return <p className="muted">Running Markowitz optimizer…</p>;
  if (error || !data) return <p className="muted danger">Unable to load optimization.</p>;

  return <OptimizerContent data={data} view={view} setView={setView} frontier={frontier} />;
};

const OptimizerContent = ({
  data,
  view,
  setView,
  frontier,
}: {
  data: OptimizationResult;
  view: "current" | "optimized";
  setView: (v: "current" | "optimized") => void;
  frontier: { variance: number; target_return: number }[];
}) => (
  <div className="optimizer-panel">
    <div className="row tabs">
      <button type="button" className={view === "current" ? "tab active" : "tab"} onClick={() => setView("current")}>
        Current
      </button>
      <button type="button" className={view === "optimized" ? "tab active" : "tab"} onClick={() => setView("optimized")}>
        Optimized
      </button>
    </div>
    <div className="risk-metric-grid">
      <div className="risk-metric-card">
        <div className="risk-metric-label">Current VaR (95%)</div>
        <div className="risk-metric-value mono">{fmtMoney(Number(data.current_var_95))}</div>
      </div>
      <div className="risk-metric-card">
        <div className="risk-metric-label">Optimized VaR (95%)</div>
        <div className="risk-metric-value mono accent">{fmtMoney(Number(data.optimized_var_95))}</div>
      </div>
    </div>
    <p className="muted small">Estimated VaR reduction: <span className="mono accent">{data.var_reduction_pct}%</span></p>
    <table className="data-table">
      <thead>
        <tr>
          <th>Ticker</th>
          <th>{view === "current" ? "Current %" : "Target %"}</th>
          <th>{view === "current" ? "Target %" : "Current %"}</th>
          <th>Action</th>
          <th>Approx shares</th>
        </tr>
      </thead>
      <tbody>
        {data.rebalancing_actions.map((row) => (
          <tr key={row.ticker}>
            <td className="mono">{row.ticker}</td>
            <td className="mono">{fmtPct(view === "current" ? row.current_weight : row.target_weight)}</td>
            <td className="mono">{fmtPct(view === "current" ? row.target_weight : row.current_weight)}</td>
            <td>
              <span className={`action-badge ${row.action.toLowerCase()}`}>{row.action}</span>
            </td>
            <td className="mono">{Math.abs(row.delta_shares_approx).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="card chart">
      <h4>Efficient Frontier</h4>
      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart>
          <XAxis type="number" dataKey="variance" name="Variance" tick={{ fill: "#9aa0b5" }} />
          <YAxis type="number" dataKey="target_return" name="Return" tick={{ fill: "#9aa0b5" }} />
          <ZAxis range={[40, 40]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#0f1923", border: "1px solid #2a2a3d" }} />
          <Scatter data={frontier} fill="#00FF87" />
          <Scatter
            data={[{ variance: frontier[0]?.variance ?? 0, target_return: frontier[0]?.target_return ?? 0 }]}
            fill="#FF4444"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  </div>
);
