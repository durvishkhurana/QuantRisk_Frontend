import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type HistogramBin = { bin_start: number; bin_end: number; count: number };

type Props = {
  histogram?: HistogramBin[] | null;
  var95Fraction?: number;
  skewness?: number;
  kurtosis?: number;
};

export const MonteCarloPanel = ({ histogram, var95Fraction, skewness = 0, kurtosis = 0 }: Props) => {
  const chartData =
    histogram?.map((b) => ({
      label: `${(b.bin_start * 100).toFixed(1)}%`,
      mid: (b.bin_start + b.bin_end) / 2,
      count: b.count,
    })) ?? [];

  return (
    <div className="terminal-card p-5 space-y-4 shadow-lg shadow-black/25">
      <div>
        <h3 className="text-xs uppercase tracking-wider font-bold text-text-primary">Monte Carlo Return Distribution</h3>
        <p className="text-text-muted text-[10px] uppercase tracking-wider mt-1">Based on 10,000 simulated multivariate normal paths</p>
      </div>
      
      {chartData.length ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ left: 0, right: 0 }}>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.03)" strokeDasharray="3 3" horizontal vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 9 }} interval={4} />
            <YAxis tick={{ fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono" }} />
            <Tooltip contentStyle={{ background: "#0a0e14", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "4px" }} />
            <Bar dataKey="count" fill="#2563eb" opacity={0.7} radius={[1, 1, 0, 0]} />
            {var95Fraction != null && (
              <ReferenceLine x={`${(var95Fraction * 100).toFixed(1)}%`} stroke="#dc2626" strokeDasharray="3 3" />
            )}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-text-muted text-xs font-sans py-8">Run a risk computation to populate the Monte Carlo histogram.</p>
      )}
      <div className="flex gap-2">
        <span className="px-2 py-0.5 rounded border border-white/[0.04] bg-white/[0.01] text-[10px] font-mono text-text-secondary">
          Skewness: <strong className="text-text-primary">{skewness.toFixed(2)}</strong>
        </span>
        <span className="px-2 py-0.5 rounded border border-white/[0.04] bg-white/[0.01] text-[10px] font-mono text-text-secondary">
          Kurtosis: <strong className="text-text-primary">{kurtosis.toFixed(2)}</strong>
        </span>
      </div>
    </div>
  );
};
