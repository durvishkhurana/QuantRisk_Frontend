import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Portfolio } from "../../api";
import { cn } from "../../lib/utils";

const badgeClass = (status?: string) => {
  if (status === "BREACH") return "text-danger bg-danger/10 border-danger/20";
  if (status === "WARNING") return "text-warning bg-warning/10 border-warning/20";
  return "text-accent-green bg-accent-green/10 border-accent-green/20";
};

export const PortfolioCard = ({ portfolio }: { portfolio: Portfolio }) => {
  const status = portfolio.latest_risk?.margin_status ?? "NORMAL";
  const util = portfolio.latest_risk?.margin_utilization;
  const utilPct = util != null ? `${(util * 100).toFixed(1)}%` : "—";
  
  // Calculate progress percent relative to margin limit. If limit is 5% and utilization is 3.5%, it's 70% of limit
  const limit = portfolio.margin_limit || 0.05;
  const pctOfLimit = util != null ? Math.min((util / limit) * 100, 100) : 0;
  
  const progressColor = 
    status === "BREACH" ? "bg-danger" : status === "WARNING" ? "bg-warning" : "bg-accent-green";

  return (
    <Link 
      to={`/portfolio/${portfolio.portfolio_id}`} 
      className="block terminal-card p-5 hover:border-accent-gold/25 shadow-md shadow-black/30 transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-semibold text-text-primary tracking-tight font-sans">{portfolio.name}</h3>
        {status === "BREACH" ? (
          <motion.span
            className={cn("text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border font-semibold font-mono", badgeClass(status))}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            {status}
          </motion.span>
        ) : (
          <span className={cn("text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border font-semibold font-mono", badgeClass(status))}>
            {status}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4 font-mono text-xs tabular-nums text-text-primary mb-4">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1 font-sans font-semibold">Value</p>
          <p className="text-sm font-semibold tracking-tight">${Math.round(portfolio.total_value).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1 font-sans font-semibold">VaR 95</p>
          <p className="text-sm font-semibold tracking-tight text-slate-300">${Math.round(portfolio.latest_risk?.var_95 ?? 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-text-muted mb-1 font-sans font-semibold">Util %</p>
          <p className="text-sm font-semibold tracking-tight text-accent-gold">{utilPct}</p>
        </div>
      </div>
      
      {/* Visual Margin Utilization Bar */}
      {util != null && (
        <div className="space-y-1">
          <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-300", progressColor)} 
              style={{ width: `${pctOfLimit}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-text-muted uppercase tracking-wider">
            <span>Utilization vs Limit</span>
            <span>{Math.round(pctOfLimit)}%</span>
          </div>
        </div>
      )}
    </Link>
  );
};
