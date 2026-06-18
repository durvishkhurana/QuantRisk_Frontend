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
  if (status === "BREACH") return "#EF4444";
  if (status === "WARNING") return "#F59E0B";
  return "#10B981";
};

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
        <h1 className="text-3xl font-semibold text-slate-50 tracking-tight">Aggregate View</h1>
        {isLoading || !data ? (
          <div className="grid md:grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="terminal-card p-4">
                <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Total Value</p>
                <p className="font-mono text-2xl tabular-nums tracking-tight text-text-primary">
                  ${Math.round(data.total_portfolio_value).toLocaleString()}
                </p>
              </div>
              <div className="terminal-card p-4">
                <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Aggregate VaR (95%)</p>
                <p className="font-mono text-2xl tabular-nums tracking-tight text-accent-cyan">
                  ${Math.round(data.aggregate_var_95).toLocaleString()}
                </p>
              </div>
              <div className="terminal-card p-4">
                <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Portfolios</p>
                <p className="font-mono text-2xl tabular-nums tracking-tight text-text-primary">{data.portfolio_count}</p>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="terminal-card p-4">
                <h2 className="text-base font-semibold text-slate-200 mb-4">VaR by Portfolio</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.breakdown}>
                    <CartesianGrid {...riskChartGrid} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <Tooltip content={<RiskTooltip valueLabel="VaR 95" />} />
                    <Bar dataKey="var_95">
                      {data.breakdown.map((entry) => (
                        <Cell key={entry.portfolio_id} fill={statusColor(entry.margin_status)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="terminal-card p-4">
                <h2 className="text-base font-semibold text-slate-200 mb-4">Value Share</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} fill="#10B981" />
                    <Tooltip content={<RiskTooltip valueLabel="Value" />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="terminal-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-widest text-text-muted border-b border-border">
                    <th className="text-left py-3 px-4">
                      <button type="button" className="hover:text-text-primary" onClick={() => setSortKey("name")}>
                        Name
                      </button>
                    </th>
                    <th className="text-right py-3 px-4">
                      <button type="button" className="hover:text-text-primary" onClick={() => setSortKey("value")}>
                        Value
                      </button>
                    </th>
                    <th className="text-right py-3 px-4">
                      <button type="button" className="hover:text-text-primary" onClick={() => setSortKey("var_95")}>
                        VaR 95
                      </button>
                    </th>
                    <th className="text-right py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row) => (
                    <tr key={row.portfolio_id} className="border-b border-border/50 hover:bg-bg-tertiary/40">
                      <td className="py-3 px-4 text-text-primary">{row.name}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        ${Math.round(Number(row.value)).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-accent-cyan">
                        ${Math.round(Number(row.var_95)).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-xs font-semibold uppercase">{row.margin_status}</td>
                      <td className="py-3 px-4 text-right">
                        <Link to={`/portfolio/${row.portfolio_id}`}>
                          <Button variant="outline" className="py-1 px-3 text-xs">
                            Open
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
