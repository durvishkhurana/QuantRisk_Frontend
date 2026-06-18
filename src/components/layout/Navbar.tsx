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
      <header className="h-14 bg-bg-secondary/75 backdrop-blur-md border-b border-white/[0.04] flex items-center justify-between px-6 sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2 font-mono text-accent-gold text-xs tracking-[0.25em] font-semibold hover:text-white transition-colors">
          <svg className="w-4 h-4 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          QR ENGINE
        </Link>
        <nav className="flex gap-6 text-xs uppercase tracking-wider font-semibold text-text-secondary">
          <Link to="/auth" className="hover:text-accent-gold transition-colors">
            Login
          </Link>
        </nav>
      </header>
    );
  }

  const [section, detail] = breadcrumb.includes("/") ? breadcrumb.split("/").map((s) => s.trim()) : ["Dashboard", breadcrumb];

  return (
    <header className="h-14 bg-bg-secondary/70 backdrop-blur-md border-b border-white/[0.04] flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="text-xs uppercase tracking-wider font-semibold">
        <span className="text-text-muted">{section}</span>
        {detail ? (
          <>
            <span className="text-text-muted mx-2">/</span>
            <span className="text-text-primary font-bold">{detail}</span>
          </>
        ) : null}
      </div>
      <div className="flex items-center gap-5">
        <span className="font-mono text-xs tabular-nums text-text-muted border-r border-white/[0.04] pr-4 py-1">{clock}</span>
        <div 
          className="flex items-center gap-2 px-2.5 py-1 rounded border border-white/[0.04] bg-white/[0.01]"
          title={wsConnected ? "WebSocket link active" : "WebSocket offline"}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              wsConnected ? "bg-accent-green animate-pulse-live" : "bg-danger",
            )}
            role="status"
            aria-label={wsConnected ? "WebSocket live" : "WebSocket offline"}
          />
          <span className="text-[9px] font-mono tracking-widest text-text-secondary uppercase font-semibold">
            {wsConnected ? "LIVE FEED" : "OFFLINE"}
          </span>
        </div>
        <span className="text-xs text-text-muted max-w-[150px] truncate hidden sm:inline font-mono">{userEmail}</span>
      </div>
    </header>
  );
};
