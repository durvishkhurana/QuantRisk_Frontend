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
    <div className="card chart">
      <h3>Monte Carlo Return Distribution</h3>
      <p className="muted small">Based on 10,000 simulated scenarios</p>
      {chartData.length ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid stroke="#1f1f2e" />
            <XAxis dataKey="label" tick={{ fill: "#9aa0b5", fontSize: 10 }} interval={4} />
            <YAxis tick={{ fill: "#9aa0b5", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0f1923", border: "1px solid #2a2a3d" }} />
            <Bar dataKey="count" fill="#00FF87" opacity={0.75} />
            {var95Fraction != null && (
              <ReferenceLine x={`${(var95Fraction * 100).toFixed(1)}%`} stroke="#FF4444" strokeDasharray="4 4" />
            )}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="muted">Run a risk computation to populate the Monte Carlo histogram.</p>
      )}
      <div className="stat-badges">
        <span className="badge">Skewness: <strong className="mono">{skewness.toFixed(2)}</strong></span>
        <span className="badge">Kurtosis: <strong className="mono">{kurtosis.toFixed(2)}</strong></span>
      </div>
    </div>
  );
};
