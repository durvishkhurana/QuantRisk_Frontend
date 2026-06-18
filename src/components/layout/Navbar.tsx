import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store";
import { cn } from "../../lib/utils";

type Props = { breadcrumb?: string; wsConnected?: boolean; sidebarCollapsed?: boolean };

export const Navbar = ({ breadcrumb = "Dashboard", wsConnected = false }: Props) => {
  const { token, userEmail } = useAuthStore();
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!token) {
    return (
      <header className="h-12 bg-bg-secondary border-b border-border flex items-center justify-between px-4">
        <Link to="/" className="font-mono text-accent-green text-sm tracking-widest">
          QR ENGINE
        </Link>
        <nav className="flex gap-4 text-sm text-text-secondary">
          <Link to="/docs" className="hover:text-accent-cyan">
            API Docs
          </Link>
          <Link to="/auth" className="hover:text-accent-cyan">
            Login
          </Link>
        </nav>
      </header>
    );
  }

  const [section, detail] = breadcrumb.includes("/") ? breadcrumb.split("/").map((s) => s.trim()) : ["Dashboard", breadcrumb];

  return (
    <header className="h-12 bg-bg-secondary border-b border-border flex items-center justify-between px-4">
      <p className="text-sm">
        <span className="text-text-secondary">{section}</span>
        {detail ? (
          <>
            <span className="text-text-secondary"> / </span>
            <span className="text-text-primary font-semibold">{detail}</span>
          </>
        ) : null}
      </p>
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs tabular-nums text-text-muted">{clock}</span>
        <span
          className={cn(
            "w-2.5 h-2.5 rounded-full shrink-0",
            wsConnected ? "bg-accent-green animate-pulse-live" : "bg-danger",
          )}
          title={wsConnected ? "Live alerts connected" : "Alerts disconnected"}
          role="status"
          aria-label={wsConnected ? "WebSocket live" : "WebSocket offline"}
        />
        <span className="text-xs text-text-muted max-w-[140px] truncate hidden sm:inline">{userEmail}</span>
      </div>
    </header>
  );
};
