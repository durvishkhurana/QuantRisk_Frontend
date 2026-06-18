import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

type Props = {
  historicalVar: number;
  monteCarloVar?: number;
  label?: string;
  marginStatus?: string;
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const CountUp = ({ value }: { value: number }) => {
  const motionValue = useMotionValue(value);
  const rounded = useTransform(motionValue, (v) => fmt(Math.round(v)));
  const [display, setDisplay] = useState(fmt(value));

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8 });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, motionValue, rounded]);

  return <motion.span className="font-mono text-2xl tabular-nums tracking-tight font-semibold text-text-primary">{display}</motion.span>;
};

const borderClass = (status?: string) => {
  if (status === "BREACH") return "border-l-2 border-danger/40";
  if (status === "WARNING") return "border-l-2 border-warning/40";
  return "border-l-2 border-accent-green/40";
};

export const RiskMetricCard = ({ historicalVar, monteCarloVar, label = "VaR (95%)", marginStatus }: Props) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div className={`terminal-card p-4 ${borderClass(marginStatus)}`}>
      <p className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-sans">
        Historical {label}
        <span className="ml-1 text-text-muted cursor-help" title="Historical simulation uses the last 252 days of actual returns.">
          ⓘ
        </span>
      </p>
      <CountUp value={historicalVar} />
    </div>
    <div className={`terminal-card p-4 ${borderClass(marginStatus)}`}>
      <p className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-sans">
        Monte Carlo {label}
        <span
          className="ml-1 text-text-muted cursor-help"
          title="Monte Carlo simulates 10,000 multivariate-normal return paths from estimated parameters."
        >
          ⓘ
        </span>
      </p>
      {monteCarloVar != null ? (
        <CountUp value={monteCarloVar} />
      ) : (
        <span className="font-mono text-[32px] font-semibold text-text-muted">—</span>
      )}
    </div>
  </div>
);
