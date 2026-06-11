import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const VaRTrendChart = ({
  history,
  marginLimitValue,
}: {
  history: Array<{ var_95: number; cvar_95: number; computed_at?: string }>;
  marginLimitValue?: number;
}) => {
  const data = history
    .slice()
    .reverse()
    .map((item, idx) => ({
      label: item.computed_at ? new Date(item.computed_at).toLocaleDateString() : `${idx + 1}`,
      var95: Number(item.var_95 ?? 0),
    }));

  return (
    <div className="terminal-card p-3">
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="varFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#00D4FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1E2D40" horizontal vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#4A5568", fontSize: 10, fontFamily: "Inter" }} />
          <YAxis
            tick={{ fill: "#8899AA", fontSize: 10, fontFamily: "JetBrains Mono" }}
            tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
          />
          <Tooltip
            contentStyle={{ background: "#0F1923", border: "1px solid #1E2D40" }}
            formatter={(v: number) => [`$${Math.round(v).toLocaleString()}`, "VaR 95"]}
          />
          <Area type="monotone" dataKey="var95" stroke="none" fill="url(#varFill)" />
          <Line
            type="monotone"
            dataKey="var95"
            stroke="#00D4FF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#00D4FF" }}
          />
          {marginLimitValue != null && (
            <ReferenceLine y={marginLimitValue} stroke="#FF4444" strokeDasharray="4 4" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
