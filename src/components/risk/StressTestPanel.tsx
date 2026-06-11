type StressTests = {
  mild?: { loss: number; pct?: number };
  moderate?: { loss: number; pct?: number };
  severe?: { loss: number; pct?: number };
};

const scenarios = [
  { key: "mild" as const, label: "MILD (-10%)" },
  { key: "moderate" as const, label: "MODERATE (-20%)" },
  { key: "severe" as const, label: "SEVERE (-30%)" },
];

const cellStyle = (loss: number, maxLoss: number) => {
  const intensity = maxLoss > 0 ? Math.min(loss / maxLoss, 1) : 0;
  const lightness = 95 - intensity * 45;
  return { backgroundColor: `hsl(0, 80%, ${lightness}%)`, color: intensity > 0.45 ? "#fff" : "#0D1117" };
};

export const StressTestPanel = ({ stress }: { stress?: StressTests }) => {
  const rows = scenarios.map((s) => ({
    label: s.label,
    loss: Number(stress?.[s.key]?.loss ?? 0),
    pct: Number(stress?.[s.key]?.pct ?? 0),
  }));
  const maxLoss = Math.max(...rows.map((r) => r.loss), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-text-muted">
            <th className="text-left py-2 pr-3">Scenario</th>
            <th className="text-right py-2 px-2">Portfolio Loss</th>
            <th className="text-right py-2 pl-2">Loss %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="py-2 pr-3 text-text-primary font-sans">{row.label}</td>
              <td className="py-2 px-2 text-right font-mono font-semibold text-text-primary">
                ${Math.round(row.loss).toLocaleString()}
              </td>
              <td
                className="py-2 pl-2 text-right font-mono text-[12px]"
                style={cellStyle(row.loss, maxLoss)}
              >
                {row.pct.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
