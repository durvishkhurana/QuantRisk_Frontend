import type { TooltipProps } from "recharts";

export const RiskTooltip = ({ active, payload, label, valueLabel = "Value" }: TooltipProps<number, string> & { valueLabel?: string }) => {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  return (
    <div className="rounded-lg border border-border/80 bg-bg-secondary px-3 py-2 shadow-sm">
      {label ? <p className="text-xs text-text-muted mb-1">{label}</p> : null}
      <p className="font-mono text-sm tabular-nums text-text-primary">
        {valueLabel}: ${Math.round(Number(value ?? 0)).toLocaleString()}
      </p>
    </div>
  );
};

export const riskChartGrid = {
  stroke: "#334155",
  strokeOpacity: 0.4,
  strokeDasharray: "3 3",
};
