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
import { RiskTooltip, riskChartGrid } from "./RiskTooltip";

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
    <div className="terminal-card p-4">
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="varFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dfc399" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#dfc399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...riskChartGrid} stroke="rgba(255,255,255,0.03)" horizontal vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 9, fontFamily: "Inter" }} />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono" }}
            tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
          />
          <Tooltip content={<RiskTooltip valueLabel="VaR 95" />} />
          <Area type="monotone" dataKey="var95" stroke="none" fill="url(#varFill)" />
          <Line
            type="monotone"
            dataKey="var95"
            stroke="#dfc399"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3.5, fill: "#dfc399", stroke: "#0a0e14", strokeWidth: 1.5 }}
          />
          {marginLimitValue != null && (
            <ReferenceLine y={marginLimitValue} stroke="#dc2626" strokeDasharray="3 3" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
