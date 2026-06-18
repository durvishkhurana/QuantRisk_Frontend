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
    <div className="terminal-card p-5 space-y-3 shadow-lg shadow-black/25">
      <p className="text-[9px] uppercase tracking-wider font-semibold text-text-muted mb-2">Margin Limit Utilization</p>
      <div className="relative h-2.5 bg-white/[0.04] rounded overflow-hidden border border-white/[0.02] shadow-inner">
        <motion.div
          className={`h-full rounded-sm ${fill}`}
          initial={false}
          animate={{ width: `${widthPct}%` }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute top-0 bottom-0 w-px bg-white/40" style={{ left: "85%" }}>
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-text-muted uppercase tracking-wider">Warn</span>
        </div>
      </div>
      <p className={`font-mono text-xs font-bold mt-2 ${textColor}`}>
        {(utilization * 100).toFixed(2)}% of {(marginLimit * 100).toFixed(1)}% margin limit
      </p>
    </div>
  );
};
