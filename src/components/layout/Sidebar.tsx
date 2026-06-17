import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, Portfolio } from "../../api";
import { useAuthStore } from "../../store";

const statusDot = (status?: string) => {
  if (status === "BREACH") return "bg-danger";
  if (status === "WARNING") return "bg-warning";
  return "bg-accent-green";
};

export const Sidebar = () => {
  const { pathname } = useLocation();
  const { userEmail, logout, token } = useAuthStore();
  const { data: portfolios } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => (await api.get("/portfolios/")).data as Portfolio[],
    enabled: Boolean(token),
  });

  const nav = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/aggregate", label: "Aggregate View" },
    { to: "/alerts", label: "Alerts" },
    { to: "/docs", label: "API Docs" },
  ];

  return (
    <aside className="w-60 shrink-0 bg-bg-secondary border-r border-border min-h-screen flex flex-col">
      <div className="px-4 py-4 border-b border-border">
        <p className="font-mono text-accent-green text-sm tracking-[0.2em]">QR ENGINE</p>
      </div>
      <nav className="p-2 flex flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`h-10 flex items-center px-3 text-sm rounded-terminal border-l-2 ${
                active
                  ? "bg-bg-tertiary border-accent-green text-text-primary"
                  : "border-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-3 mt-2 border-t border-border flex-1 overflow-auto">
        <p className="text-[11px] uppercase tracking-wider text-text-muted mb-2">Portfolios</p>
        <div className="flex flex-col gap-1">
          {(portfolios ?? []).map((p) => {
            const active = pathname === `/portfolio/${p.portfolio_id}`;
            return (
              <Link
                key={p.portfolio_id}
                to={`/portfolio/${p.portfolio_id}`}
                className={`h-10 px-2 flex items-center justify-between gap-2 rounded-terminal text-sm ${
                  active ? "bg-bg-tertiary text-text-primary" : "text-text-secondary hover:bg-bg-tertiary"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full ${statusDot(p.latest_risk?.margin_status)}`} />
                  <span className="truncate">{p.name}</span>
                </span>
                <span className="font-mono text-[11px] text-text-secondary">
                  ${Math.round(p.latest_risk?.var_95 ?? 0).toLocaleString()}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="p-3 border-t border-border">
        <p className="text-text-muted text-xs truncate mb-2">{userEmail}</p>
        <button type="button" className="text-text-secondary text-sm hover:text-text-primary" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
};
