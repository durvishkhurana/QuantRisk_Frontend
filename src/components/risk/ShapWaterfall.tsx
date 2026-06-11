import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Item = { ticker: string; contribution: number; pct_of_var?: number };

export const ShapWaterfall = ({ items, maxItems = 12, height = 240 }: { items: Item[]; maxItems?: number; height?: number }) => {
  if (!items.length) return <p className="text-text-muted text-sm">No SHAP data yet.</p>;
  const data = items.slice(0, maxItems).map((x) => ({
    ticker: x.ticker,
    contribution: Number(x.contribution),
  }));
  const vertical = data.length > 8;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={vertical ? "vertical" : "horizontal"} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
        <CartesianGrid stroke="#1E2D40" horizontal vertical={false} />
        <XAxis
          type={vertical ? "number" : "category"}
          dataKey={vertical ? undefined : "ticker"}
          tick={{ fill: "#8899AA", fontSize: 11 }}
          angle={vertical ? 0 : -65}
          textAnchor={vertical ? "end" : "end"}
          height={vertical ? 30 : 70}
        />
        <YAxis
          type={vertical ? "category" : "number"}
          dataKey={vertical ? "ticker" : undefined}
          tick={{ fill: "#E8EFF7", fontSize: 12, fontFamily: "JetBrains Mono" }}
          width={vertical ? 56 : 48}
        />
        <Tooltip
          contentStyle={{ background: "#0F1923", border: "1px solid #1E2D40", color: "#E8EFF7" }}
          formatter={(value: number) => [`$${Math.round(value).toLocaleString()}`, "Contribution"]}
          labelStyle={{ color: "#8899AA", fontSize: 11 }}
        />
        <Bar dataKey="contribution" radius={[2, 2, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.ticker} fill={entry.contribution >= 0 ? "rgba(255,68,68,0.8)" : "rgba(0,255,135,0.8)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
