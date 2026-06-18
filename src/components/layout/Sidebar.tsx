import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, Portfolio } from "../../api";
import { useAuthStore } from "../../store";
import { cn } from "../../lib/utils";

const statusDot = (status?: string) => {
  if (status === "BREACH") return "bg-danger";
  if (status === "WARNING") return "bg-warning";
  return "bg-accent-green";
};

const NAV = [
  { to: "/dashboard", label: "Dashboard", short: "D" },
  { to: "/aggregate", label: "Aggregate View", short: "A" },
  { to: "/alerts", label: "Alerts", short: "!" },
  { to: "/docs", label: "API Docs", short: "?" },
] as const;

type Props = { collapsed: boolean; onToggle: () => void };

export const Sidebar = ({ collapsed, onToggle }: Props) => {
  const { pathname } = useLocation();
  const { userEmail, logout, token } = useAuthStore();
  const { data: portfolios } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => (await api.get("/portfolios")).data as Portfolio[],
    enabled: Boolean(token),
  });

  return (
    <aside
      className={cn(
        "shrink-0 bg-bg-secondary border-r border-border min-h-screen flex flex-col transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="px-4 py-4 border-b border-border flex items-center justify-between gap-2">
        {!collapsed ? (
          <p className="font-mono text-accent-green text-sm tracking-widest">QR ENGINE</p>
        ) : (
          <p className="font-mono text-accent-green text-sm mx-auto">QR</p>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="text-text-muted hover:text-text-primary text-xs p-1 rounded focus-visible:ring-2 ring-accent-cyan/50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>
      <nav className="p-2 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              className={cn(
                "h-10 flex items-center rounded-lg border-l-2 text-sm transition-colors",
                collapsed ? "justify-center px-0" : "px-3",
                active
                  ? "bg-bg-tertiary border-accent-green text-text-primary"
                  : "border-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
              )}
            >
              {collapsed ? (
                <span className="font-mono text-xs">{item.short}</span>
              ) : (
                item.label
              )}
            </Link>
          );
        })}
      </nav>
      <div className={cn("px-3 py-3 mt-2 border-t border-border flex-1 overflow-auto", collapsed && "px-1")}>
        {!collapsed ? (
          <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Portfolios</p>
        ) : null}
        <div className="flex flex-col gap-1">
          {(portfolios ?? []).map((p) => {
            const active = pathname === `/portfolio/${p.portfolio_id}`;
            return (
              <Link
                key={p.portfolio_id}
                to={`/portfolio/${p.portfolio_id}`}
                title={p.name}
                className={cn(
                  "min-h-10 px-2 flex items-center rounded-lg text-sm transition-colors",
                  collapsed ? "justify-center" : "justify-between gap-2",
                  active ? "bg-bg-tertiary text-text-primary" : "text-text-secondary hover:bg-bg-tertiary",
                )}
              >
                <span className={cn("flex items-center gap-2", !collapsed && "truncate")}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot(p.latest_risk?.margin_status)}`} />
                  {!collapsed ? <span className="truncate">{p.name}</span> : null}
                </span>
                {!collapsed ? (
                  <span className="font-mono text-xs tabular-nums text-text-secondary">
                    ${Math.round(p.latest_risk?.var_95 ?? 0).toLocaleString()}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="p-3 border-t border-border">
        {!collapsed ? <p className="text-text-muted text-xs truncate mb-2">{userEmail}</p> : null}
        <button
          type="button"
          className="text-text-secondary text-sm hover:text-text-primary w-full text-left"
          onClick={logout}
        >
          {collapsed ? "⎋" : "Logout"}
        </button>
      </div>
    </aside>
  );
};
