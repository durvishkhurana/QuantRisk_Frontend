import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getAggregateRisk } from "../api/portfolios";
import { AppShell } from "../components/layout/AppShell";
import { RiskTooltip, riskChartGrid } from "../components/risk/RiskTooltip";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";

const statusColor = (status: string) => {
  if (status === "BREACH") return "#dc2626";
  if (status === "WARNING") return "#f59e0b";
  return "#10b981";
};

// Elegant color array for the value distribution pie chart
const PIE_COLORS = [
  "#2563eb", // Royal Sapphire
  "#dfc399", // Gold
  "#10b981", // Emerald
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
];

export const AggregateViewPage = () => {
  const { data, isLoading } = useQuery({ queryKey: ["aggregate-risk"], queryFn: getAggregateRisk });
  const [sortKey, setSortKey] = useState<"name" | "value" | "var_95">("var_95");

  const sorted = useMemo(() => {
    const rows = [...(data?.breakdown ?? [])];
    rows.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return Number(b[sortKey]) - Number(a[sortKey]);
    });
    return rows;
  }, [data, sortKey]);

  const pieData = (data?.breakdown ?? []).map((p) => ({ name: p.name, value: Number(p.value) }));

  return (
    <AppShell breadcrumb="Dashboard / Aggregate">
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="pb-4 border-b border-white/[0.04]">
          <h1 className="text-xl font-bold text-text-primary tracking-tight font-sans">Firm Risk Aggregate</h1>
          <p className="text-text-muted text-[11px] uppercase tracking-wider mt-1">Cross-portfolio asset values &amp; Value-at-Risk limits</p>
        </div>

        {isLoading || !data ? (
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="terminal-card p-5">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-2">Total Assets Value</p>
                <p className="font-mono text-2xl tabular-nums tracking-tight font-semibold text-text-primary">
                  ${Math.round(data.total_portfolio_value).toLocaleString()}
                </p>
              </div>
              <div className="terminal-card p-5 border-l-2 border-accent-cyan">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-2">Aggregate VaR (95%)</p>
                <p className="font-mono text-2xl tabular-nums tracking-tight font-semibold text-accent-cyan">
                  ${Math.round(data.aggregate_var_95).toLocaleString()}
                </p>
              </div>
              <div className="terminal-card p-5">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-2">Active Funds</p>
                <p className="font-mono text-2xl tabular-nums tracking-tight font-semibold text-text-primary">{data.portfolio_count}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="terminal-card p-5">
                <h2 className="text-xs uppercase tracking-wider font-bold text-text-primary mb-4">VaR Contribution by Portfolio</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.breakdown} margin={{ bottom: 15 }}>
                    <CartesianGrid {...riskChartGrid} stroke="#172230" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Inter" }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 10, fontFamily: "JetBrains Mono" }} tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} />
                    <Tooltip content={<RiskTooltip valueLabel="VaR 95" />} />
                    <Bar dataKey="var_95" radius={[2, 2, 0, 0]}>
                      {data.breakdown.map((entry) => (
                        <Cell key={entry.portfolio_id} fill={statusColor(entry.margin_status)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="terminal-card p-5">
                <h2 className="text-xs uppercase tracking-wider font-bold text-text-primary mb-4">Assets Distribution Share</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<RiskTooltip valueLabel="Value" />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="terminal-card overflow-x-auto shadow-md shadow-black/20">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-white/[0.04] bg-bg-secondary">
                    <th className="py-2.5 px-4">
                      <button type="button" className="hover:text-text-primary uppercase tracking-wider font-bold" onClick={() => setSortKey("name")}>
                        Fund Name
                      </button>
                    </th>
                    <th className="text-right py-2.5 px-4">
                      <button type="button" className="hover:text-text-primary uppercase tracking-wider font-bold" onClick={() => setSortKey("value")}>
                        Assets Value
                      </button>
                    </th>
                    <th className="text-right py-2.5 px-4">
                      <button type="button" className="hover:text-text-primary uppercase tracking-wider font-bold" onClick={() => setSortKey("var_95")}>
                        VaR 95
                      </button>
                    </th>
                    <th className="text-right py-2.5 px-4 font-bold">Risk Status</th>
                    <th className="text-right py-2.5 px-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {sorted.map((row) => (
                    <tr key={row.portfolio_id} className="h-11 hover:bg-bg-tertiary/40 transition-colors align-middle">
                      <td className="py-3 px-4 text-text-primary font-sans font-semibold">{row.name}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-text-primary font-medium">
                        ${Math.round(Number(row.value)).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-accent-cyan font-semibold">
                        ${Math.round(Number(row.var_95)).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-wider font-mono border ${
                          row.margin_status === "BREACH" ? "text-danger bg-danger/10 border-danger/20" :
                          row.margin_status === "WARNING" ? "text-warning bg-warning/10 border-warning/20" :
                          "text-accent-green bg-accent-green/10 border-accent-green/20"
                        }`}>
                          {row.margin_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link to={`/portfolio/${row.portfolio_id}`}>
                          <Button variant="outline" className="py-1 px-3 text-[10px]">
                            Open Fund
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
};
