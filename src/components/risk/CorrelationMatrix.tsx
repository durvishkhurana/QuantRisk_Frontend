import { Fragment } from "react";
import { motion } from "framer-motion";
import type { CorrelationRegime } from "../../api/risk";
import { cn } from "../../lib/utils";

const cellColor = (corr: number) => {
  // Deep gold/red gradient for correlation cells
  const hue = corr >= 0 ? 35 : 0; // warm amber for positive, red for negative
  const sat = Math.round(Math.min(100, Math.max(0, Math.abs(corr) * 80)));
  const light = Math.round(15 + Math.abs(corr) * 35); // Keep it dark and premium
  return `hsl(${hue}, ${sat}%, ${light}%)`;
};

type Props = { data?: CorrelationRegime | null };

export const CorrelationMatrix = ({ data }: Props) => {
  if (!data?.matrix_30d) return <p className="text-text-muted text-xs">No correlation matrix available yet.</p>;
  const tickers = Object.keys(data.matrix_30d);
  
  const isStress = data.regime === "STRESS";
  const regimeClass = cn(
    "px-2 py-0.5 rounded text-[9px] font-bold tracking-wider font-mono border",
    isStress ? "text-danger bg-danger/10 border-danger/20" :
    data.regime === "ELEVATED" ? "text-warning bg-warning/10 border-warning/20" :
    "text-accent-green bg-accent-green/10 border-accent-green/20"
  );

  return (
    <div className="terminal-card p-5 space-y-4 shadow-lg shadow-black/25">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xs uppercase tracking-wider font-bold text-text-primary">Correlation Regime Heatmap</h3>
        {isStress ? (
          <motion.span className={regimeClass} animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            {data.regime}
          </motion.span>
        ) : (
          <span className={regimeClass}>{data.regime}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 text-[10px] text-text-secondary font-sans border-b border-white/[0.04] pb-3">
        <div>
          <span className="text-text-muted font-semibold uppercase tracking-wider block mb-0.5">Correlation Spike</span>
          <span className="font-mono text-xs text-accent-green font-bold">+{data.correlation_spike.toFixed(2)}</span>
          <span className="text-text-muted font-sans font-medium text-[9px] ml-1">vs 252d baseline ({data.avg_correlation_252d.toFixed(2)})</span>
        </div>
        <div>
          <span className="text-text-muted font-semibold uppercase tracking-wider block mb-0.5">Most Correlated Pair</span>
          <span className="font-mono text-xs text-text-primary font-bold">
            {data.most_correlated_pair.ticker_a} / {data.most_correlated_pair.ticker_b}
          </span>
          <span className="font-mono text-[10px] text-accent-gold font-semibold ml-1">
            ({data.most_correlated_pair.correlation_30d.toFixed(2)})
          </span>
        </div>
      </div>
      <div className="overflow-x-auto pt-2">
        <div className="corr-grid min-w-[320px]" style={{ gridTemplateColumns: `repeat(${tickers.length + 1}, minmax(40px, 1fr))` }}>
          <div />
          {tickers.map((t) => (
            <div key={`h-${t}`} className="corr-label font-mono text-[9px] font-bold text-text-muted text-center uppercase tracking-wider pb-2">
              {t}
            </div>
          ))}
          {tickers.map((rowTicker) => (
            <Fragment key={rowTicker}>
              <div className="corr-label font-mono text-[10px] font-bold text-text-primary text-left align-middle flex items-center pr-2">
                {rowTicker}
              </div>
              {tickers.map((colTicker) => {
                const val = data.matrix_30d?.[rowTicker]?.[colTicker] ?? 0;
                return (
                  <div
                    key={`${rowTicker}-${colTicker}`}
                    className="font-mono text-[10px] font-semibold text-center border border-black/50 rounded-sm py-1.5 text-white/90 shadow-sm"
                    style={{ backgroundColor: cellColor(val) }}
                    title={`${rowTicker}/${colTicker}: ${val.toFixed(3)}`}
                  >
                    {val.toFixed(2)}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
