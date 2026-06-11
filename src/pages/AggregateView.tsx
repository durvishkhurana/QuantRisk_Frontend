import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getAggregateRisk } from "../api/portfolios";
import { AppShell } from "../components/layout/AppShell";

const statusColor = (status: string) => {
  if (status === "BREACH") return "#FF4444";
  if (status === "WARNING") return "#f5c542";
  return "#00FF87";
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
      <section className="max-w-6xl mx-auto space-y-4">
        <h2>Aggregate View</h2>
        {isLoading || !data ? (
          <p className="muted">Loading aggregate risk…</p>
        ) : (
          <>
            <div className="risk-metric-grid three">
              <div className="risk-metric-card">
                <div className="risk-metric-label">Total Value</div>
                <div className="risk-metric-value mono">${Math.round(data.total_portfolio_value).toLocaleString()}</div>
              </div>
              <div className="risk-metric-card">
                <div className="risk-metric-label">Aggregate VaR (95%)</div>
                <div className="risk-metric-value mono accent">${Math.round(data.aggregate_var_95).toLocaleString()}</div>
              </div>
              <div className="risk-metric-card">
                <div className="risk-metric-label">Portfolios</div>
                <div className="risk-metric-value mono">{data.portfolio_count}</div>
              </div>
            </div>
            <div className="grid two">
              <div className="card chart">
                <h3>VaR by Portfolio</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.breakdown}>
                    <XAxis dataKey="name" tick={{ fill: "#9aa0b5", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#9aa0b5" }} />
                    <Tooltip contentStyle={{ background: "#0f1923", border: "1px solid #2a2a3d" }} />
                    <Bar dataKey="var_95">
                      {data.breakdown.map((entry) => (
                        <Cell key={entry.portfolio_id} fill={statusColor(entry.margin_status)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card chart">
                <h3>Value Share</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} fill="#00FF87" />
                    <Tooltip contentStyle={{ background: "#0f1923", border: "1px solid #2a2a3d" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <button type="button" className="linkish" onClick={() => setSortKey("name")}>
                      Portfolio
                    </button>
                  </th>
                  <th>
                    <button type="button" className="linkish" onClick={() => setSortKey("value")}>
                      Value
                    </button>
                  </th>
                  <th>
                    <button type="button" className="linkish" onClick={() => setSortKey("var_95")}>
                      VaR
                    </button>
                  </th>
                  <th>VaR % of value</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.portfolio_id}>
                    <td>{row.name}</td>
                    <td className="mono">${Math.round(row.value).toLocaleString()}</td>
                    <td className="mono">${Math.round(row.var_95).toLocaleString()}</td>
                    <td className="mono">{((row.var_95 / Math.max(row.value, 1)) * 100).toFixed(2)}%</td>
                    <td>
                      <span className={`action-badge ${row.margin_status.toLowerCase()}`}>{row.margin_status}</span>
                    </td>
                    <td>
                      <Link to={`/portfolio/${row.portfolio_id}`}>Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </AppShell>
  );
};
