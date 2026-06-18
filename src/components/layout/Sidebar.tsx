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

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

type Props = { collapsed: boolean; onToggle: () => void };

export const Sidebar = ({ collapsed, onToggle }: Props) => {
  const { pathname } = useLocation();
  const { userEmail, logout, token } = useAuthStore();
  const { data: portfolios } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => (await api.get("/portfolios")).data as Portfolio[],
    enabled: Boolean(token),
  });

  const NAV: NavItem[] = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      to: "/aggregate",
      label: "Aggregate View",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
    },
    {
      to: "/alerts",
      label: "Alerts",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={cn(
        "shrink-0 bg-bg-secondary border-r border-white/[0.04] min-h-screen flex flex-col transition-[width] duration-200 z-50",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between gap-2 h-14">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <p className="font-mono text-accent-gold text-xs tracking-[0.25em] font-bold">QR ENGINE</p>
          </div>
        ) : (
          <p className="font-mono text-accent-gold text-[10px] mx-auto font-bold tracking-widest">QR</p>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="text-text-muted hover:text-text-primary p-1.5 rounded hover:bg-white/[0.02] border border-transparent hover:border-white/[0.04] transition-all focus-outline-none"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>
      <nav className="p-3 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              className={cn(
                "h-9 flex items-center rounded text-xs font-semibold uppercase tracking-wider transition-all duration-150 border",
                collapsed ? "justify-center px-0 border-transparent" : "px-3 gap-3",
                active
                  ? "bg-bg-tertiary border-accent-gold/25 text-accent-gold shadow-gold"
                  : "border-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className={cn("px-4 py-3 mt-2 border-t border-white/[0.04] flex-1 overflow-auto", collapsed && "px-1")}>
        {!collapsed ? (
          <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-text-muted mb-3">Portfolios</p>
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
                  "min-h-9 px-2 flex items-center rounded text-xs font-medium transition-all duration-150 border",
                  collapsed ? "justify-center border-transparent" : "justify-between gap-2 border-transparent",
                  active ? "bg-bg-tertiary/60 border-white/[0.02] text-text-primary" : "text-text-secondary hover:bg-bg-tertiary/40 hover:text-text-primary",
                )}
              >
                <span className={cn("flex items-center gap-2", !collapsed && "truncate")}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(p.latest_risk?.margin_status)}`} />
                  {!collapsed ? <span className="truncate text-slate-300 font-sans">{p.name}</span> : null}
                </span>
                {!collapsed ? (
                  <span className="font-mono text-[10px] tabular-nums text-text-muted">
                    ${Math.round(p.latest_risk?.var_95 ?? 0).toLocaleString()}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="p-4 border-t border-white/[0.04] bg-bg-primary/30 flex flex-col gap-2">
        {!collapsed ? (
          <p className="text-text-muted text-[10px] font-mono truncate">{userEmail}</p>
        ) : null}
        <button
          type="button"
          className={cn(
            "text-text-secondary text-xs hover:text-text-primary w-full text-left font-semibold uppercase tracking-wider flex items-center gap-2",
            collapsed && "justify-center"
          )}
          onClick={logout}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
