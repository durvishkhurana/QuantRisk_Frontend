import { Fragment } from "react";
import { motion } from "framer-motion";
import type { CorrelationRegime } from "../../api/risk";

const cellColor = (corr: number) => {
  const hue = 0;
  const sat = Math.round(Math.min(100, Math.max(0, corr * 100)));
  const light = Math.round(100 - corr * 45);
  return `hsl(${hue}, ${sat}%, ${light}%)`;
};

type Props = { data?: CorrelationRegime | null };

export const CorrelationMatrix = ({ data }: Props) => {
  if (!data?.matrix_30d) return <p className="muted">No correlation matrix available yet.</p>;
  const tickers = Object.keys(data.matrix_30d);
  const regimeClass =
    data.regime === "STRESS" ? "regime stress" : data.regime === "ELEVATED" ? "regime elevated" : "regime normal";

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h3>Correlation Regime</h3>
        {data.regime === "STRESS" ? (
          <motion.span className={regimeClass} animate={{ opacity: [1, 0.45, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
            {data.regime}
          </motion.span>
        ) : (
          <span className={regimeClass}>{data.regime}</span>
        )}
      </div>
      <p className="muted small">
        Spike: <span className="mono accent">+{data.correlation_spike.toFixed(2)}</span> vs 252-day baseline (
        {data.avg_correlation_252d.toFixed(2)})
      </p>
      <p className="muted small">
        Most correlated pair: {data.most_correlated_pair.ticker_a} / {data.most_correlated_pair.ticker_b} (
        {data.most_correlated_pair.correlation_30d.toFixed(2)})
      </p>
      <div className="corr-grid" style={{ gridTemplateColumns: `repeat(${tickers.length + 1}, minmax(48px, 1fr))` }}>
        <div />
        {tickers.map((t) => (
          <div key={`h-${t}`} className="corr-label mono">
            {t}
          </div>
        ))}
        {tickers.map((rowTicker) => (
          <Fragment key={rowTicker}>
            <div className="corr-label mono">
              {rowTicker}
            </div>
            {tickers.map((colTicker) => {
              const val = data.matrix_30d?.[rowTicker]?.[colTicker] ?? 0;
              return (
                <div
                  key={`${rowTicker}-${colTicker}`}
                  className="corr-cell mono"
                  style={{ backgroundColor: cellColor(val) }}
                  title={`${rowTicker}/${colTicker}`}
                >
                  {val.toFixed(2)}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
};
