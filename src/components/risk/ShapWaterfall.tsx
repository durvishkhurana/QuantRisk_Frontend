import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Item = { ticker: string; contribution: number; pct_of_var?: number };

export const ShapWaterfall = ({ items, maxItems = 12, height = 240 }: { items: Item[]; maxItems?: number; height?: number }) => {
  if (!items.length) return <p className="text-text-muted text-xs">No SHAP attribution records.</p>;
  const data = items.slice(0, maxItems).map((x) => ({
    ticker: x.ticker,
    contribution: Number(x.contribution),
  }));
  const vertical = data.length > 8;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={vertical ? "vertical" : "horizontal"} margin={{ left: 0, right: 0, top: 4, bottom: 4 }}>
        <CartesianGrid stroke="rgba(255, 255, 255, 0.03)" strokeDasharray="3 3" horizontal vertical={false} />
        <XAxis
          type={vertical ? "number" : "category"}
          dataKey={vertical ? undefined : "ticker"}
          tick={{ fill: "#64748b", fontSize: 9, fontFamily: "Inter" }}
          angle={vertical ? 0 : -45}
          textAnchor={vertical ? "end" : "end"}
          height={vertical ? 30 : 50}
        />
        <YAxis
          type={vertical ? "category" : "number"}
          dataKey={vertical ? "ticker" : undefined}
          tick={{ fill: "#cbd5e1", fontSize: 9, fontFamily: "JetBrains Mono" }}
          width={vertical ? 48 : 40}
        />
        <Tooltip
          contentStyle={{ background: "#0a0e14", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "4px" }}
          formatter={(value: number) => [`$${Math.round(value).toLocaleString()}`, "Contribution"]}
          labelStyle={{ color: "#64748b", fontSize: 9, fontFamily: "Inter" }}
        />
        <Bar dataKey="contribution" radius={vertical ? [0, 2, 2, 0] : [2, 2, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.ticker} fill={entry.contribution >= 0 ? "#dc2626" : "#10b981"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
