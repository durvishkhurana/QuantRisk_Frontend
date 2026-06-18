import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Scatter, ScatterChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ZAxis, CartesianGrid } from "recharts";
import { getOptimization, type OptimizationResult } from "../../api/risk";
import { Button } from "../ui/button";

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

  if (isLoading) return <p className="text-text-muted text-xs">Running Markowitz mean-variance optimizer (efficient frontier)…</p>;
  if (error || !data) return <p className="text-danger text-xs font-semibold">Unable to compile portfolio optimization parameters.</p>;

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
  <div className="terminal-card p-5 space-y-6 shadow-lg shadow-black/25">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-4">
      <div>
        <h3 className="text-xs uppercase tracking-wider font-bold text-text-primary">Markowitz Mean-Variance Optimization</h3>
        <p className="text-text-muted text-[10px] uppercase tracking-wider mt-1">Rebalancing suggestions based on efficient frontier modeling</p>
      </div>
      
      <div className="grid grid-cols-2 gap-1 p-0.5 bg-black/45 rounded border border-white/[0.04]">
        <button 
          type="button" 
          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-150 ${view === "current" ? "bg-bg-tertiary text-accent-gold border border-white/[0.02] shadow-sm shadow-black/15" : "text-text-muted hover:text-text-primary"}`} 
          onClick={() => setView("current")}
        >
          Current allocations
        </button>
        <button 
          type="button" 
          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-150 ${view === "optimized" ? "bg-bg-tertiary text-accent-gold border border-white/[0.02] shadow-sm shadow-black/15" : "text-text-muted hover:text-text-primary"}`} 
          onClick={() => setView("optimized")}
        >
          Optimized weights
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="bg-[#05070c] border border-white/[0.04] p-4 rounded shadow-inner">
        <div className="text-[9px] uppercase tracking-wider font-semibold text-text-muted mb-1">Current VaR (95%)</div>
        <div className="font-mono text-base font-bold text-text-primary">{fmtMoney(Number(data.current_var_95))}</div>
      </div>
      <div className="bg-[#05070c] border border-white/[0.04] p-4 rounded shadow-inner border-l-2 border-accent-green/45">
        <div className="text-[9px] uppercase tracking-wider font-semibold text-text-muted mb-1">Optimized VaR (95%)</div>
        <div className="font-mono text-base font-bold text-accent-green">{fmtMoney(Number(data.optimized_var_95))}</div>
      </div>
    </div>
    
    <div className="text-[10px] text-text-secondary leading-relaxed bg-[#05070c]/30 p-2.5 rounded border border-white/[0.02] flex justify-between items-center font-mono">
      <span className="uppercase tracking-wider text-text-muted text-[9px] font-sans font-semibold">Estimated risk reduction</span>
      <span className="text-accent-green font-bold">+{data.var_reduction_pct}%</span>
    </div>

    <div className="overflow-x-auto rounded border border-white/[0.04]">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="text-[9px] uppercase tracking-wider text-text-muted border-b border-white/[0.04] bg-bg-secondary">
            <th className="py-2.5 px-4">Ticker</th>
            <th className="text-right py-2.5 px-4">{view === "current" ? "Current Weight" : "Target Weight"}</th>
            <th className="text-right py-2.5 px-4">{view === "current" ? "Target Weight" : "Current Weight"}</th>
            <th className="text-center py-2.5 px-4">Action</th>
            <th className="text-right py-2.5 px-4">Approx Shares</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.03]">
          {data.rebalancing_actions.map((row) => (
            <tr key={row.ticker} className="h-10 hover:bg-bg-tertiary/20 transition-colors align-middle">
              <td className="px-4 font-mono font-bold text-accent-cyan">{row.ticker}</td>
              <td className="px-4 text-right font-mono text-text-primary">{fmtPct(view === "current" ? row.current_weight : row.target_weight)}</td>
              <td className="px-4 text-right font-mono text-text-muted">{fmtPct(view === "current" ? row.target_weight : row.current_weight)}</td>
              <td className="px-4 text-center">
                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-wider font-mono border ${
                  row.action.toLowerCase() === "buy" ? "text-accent-green bg-accent-green/10 border-accent-green/20" :
                  row.action.toLowerCase() === "sell" ? "text-danger bg-danger/10 border-danger/20" :
                  "text-text-secondary bg-bg-tertiary border-white/[0.04]"
                }`}>{row.action}</span>
              </td>
              <td className="px-4 text-right font-mono text-text-primary font-semibold">{Math.abs(row.delta_shares_approx).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="bg-[#05070c] border border-white/[0.04] p-4 rounded shadow-inner space-y-3">
      <h4 className="text-[10px] uppercase text-text-muted font-semibold tracking-wider">Efficient Frontier Plot</h4>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ left: -15, right: 10, top: 10 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
            <XAxis type="number" dataKey="variance" name="Variance" tick={{ fill: "#64748b", fontSize: 9 }} />
            <YAxis type="number" dataKey="target_return" name="Return" tick={{ fill: "#64748b", fontSize: 9 }} />
            <ZAxis range={[35, 35]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#0a0e14", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "4px" }} />
            <Scatter data={frontier} fill="#dfc399" />
            <Scatter
              data={[{ variance: frontier[0]?.variance ?? 0, target_return: frontier[0]?.target_return ?? 0 }]}
              fill="#dc2626"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);
