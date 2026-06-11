import { motion } from "framer-motion";

export type AlertItem = {
  id: string;
  portfolio_name: string;
  event_type: string;
  description: string;
  triggered_at: string;
};

const dotClass = (type: string) => {
  if (type === "BREACH") return "bg-danger";
  if (type === "CORRELATION_ALERT") return "bg-orange-400";
  if (type === "WARNING") return "bg-warning";
  return "bg-accent-green";
};

export const AlertFeed = ({ items, highlightId }: { items: AlertItem[]; highlightId?: string }) => (
  <div className="terminal-panel overflow-hidden">
    {items.length === 0 ? (
      <p className="px-3 py-4 text-xs text-text-muted">No recent margin events — live feed will update on new alerts.</p>
    ) : null}
    {items.map((item) => {
      const breach = item.event_type === "BREACH";
      const highlighted = highlightId === item.id;
      return (
        <motion.div
          key={item.id}
          initial={highlighted ? { y: -8, opacity: 0 } : false}
          animate={highlighted ? { y: 0, opacity: 1 } : undefined}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-12 flex items-center gap-3 px-3 border-b border-border ${
            breach ? "bg-danger/5" : ""
          } ${highlighted ? "animate-[pulse-border_1s_ease-in-out_3]" : ""}`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass(item.event_type)}`} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-text-primary truncate">{item.portfolio_name}</p>
            <p className="text-xs text-text-secondary truncate">{item.description}</p>
          </div>
          <time className="font-mono text-[11px] text-text-muted shrink-0">{item.triggered_at}</time>
        </motion.div>
      );
    })}
  </div>
);
