import { motion } from "framer-motion";

type Props = {
  utilization: number;
  marginLimit?: number;
};

export const MarginGauge = ({ utilization, marginLimit = 0.05 }: Props) => {
  const pct = Math.min(utilization / marginLimit, 1.2);
  const widthPct = Math.min(pct * 100, 100);
  const fill =
    pct >= 0.85 ? "bg-danger" : pct >= 0.7 ? "bg-warning" : "bg-accent-green";
  const textColor =
    pct >= 0.85 ? "text-danger" : pct >= 0.7 ? "text-warning" : "text-accent-green";

  return (
    <div className="terminal-card p-4">
      <p className="text-[11px] uppercase tracking-[0.15em] text-text-secondary mb-3">Margin utilization</p>
      <div className="relative h-2 bg-border rounded-terminal overflow-hidden">
        <motion.div
          className={`h-full ${fill}`}
          initial={false}
          animate={{ width: `${widthPct}%` }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute top-0 bottom-0 w-px bg-text-primary/80" style={{ left: "85%" }}>
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-text-muted">WARN</span>
        </div>
      </div>
      <p className={`font-mono text-sm mt-2 ${textColor}`}>
        {(utilization * 100).toFixed(1)}% of margin limit
      </p>
    </div>
  );
};
