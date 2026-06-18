import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Portfolio } from "../../api";

const badgeClass = (status?: string) => {
  if (status === "BREACH") return "text-danger bg-danger/10 border-danger/30";
  if (status === "WARNING") return "text-warning bg-warning/10 border-warning/30";
  return "text-accent-green bg-accent-green/10 border-accent-green/30";
};

export const PortfolioCard = ({ portfolio }: { portfolio: Portfolio }) => {
  const status = portfolio.latest_risk?.margin_status ?? "NORMAL";
  const util = portfolio.latest_risk?.margin_utilization;
  const utilPct = util != null ? `${(util * 100).toFixed(1)}%` : "—";

  return (
    <Link to={`/portfolio/${portfolio.portfolio_id}`} className="block terminal-card p-4 hover:border-sky-500/30 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-base font-semibold text-text-primary">{portfolio.name}</h3>
        {status === "BREACH" ? (
          <motion.span
            className={`text-xs uppercase px-2 py-0.5 rounded-lg border font-semibold ${badgeClass(status)}`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          >
            {status}
          </motion.span>
        ) : (
          <span className={`text-xs uppercase px-2 py-0.5 rounded-lg border font-semibold ${badgeClass(status)}`}>
            {status}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4 font-mono text-sm tabular-nums text-text-primary">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Value</p>
          <p className="text-lg tracking-tight">${Math.round(portfolio.total_value).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted mb-1">VaR 95</p>
          <p className="text-lg tracking-tight">${Math.round(portfolio.latest_risk?.var_95 ?? 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Util</p>
          <p className="text-lg tracking-tight">{utilPct}</p>
        </div>
      </div>
    </Link>
  );
};
