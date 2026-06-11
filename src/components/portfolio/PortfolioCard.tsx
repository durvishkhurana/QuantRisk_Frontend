import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Portfolio } from "../../api";

const badgeClass = (status?: string) => {
  if (status === "BREACH") return "text-danger bg-danger/10";
  if (status === "WARNING") return "text-warning bg-warning/10";
  return "text-accent-green bg-accent-green/10";
};

export const PortfolioCard = ({ portfolio }: { portfolio: Portfolio }) => {
  const status = portfolio.latest_risk?.margin_status ?? "NORMAL";
  return (
    <Link to={`/portfolio/${portfolio.portfolio_id}`} className="block terminal-card p-4 hover:border-accent-cyan/40">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-sm text-text-primary font-sans">{portfolio.name}</h3>
        {status === "BREACH" ? (
          <motion.span
            className={`text-[10px] uppercase px-2 py-0.5 rounded-terminal font-sans ${badgeClass(status)}`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          >
            {status}
          </motion.span>
        ) : (
          <span className={`text-[10px] uppercase px-2 py-0.5 rounded-terminal font-sans ${badgeClass(status)}`}>
            {status}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 font-mono text-sm text-text-primary">
        <div>
          <p className="text-[10px] text-text-muted uppercase">Value</p>
          <p>${Math.round(portfolio.total_value).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase">VaR 95</p>
          <p>${Math.round(portfolio.latest_risk?.var_95 ?? 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase">Util</p>
          <p>—</p>
        </div>
      </div>
    </Link>
  );
};
