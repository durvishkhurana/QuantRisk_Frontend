import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store";

type Props = { breadcrumb?: string; wsConnected?: boolean };

export const Navbar = ({ breadcrumb = "Dashboard", wsConnected = false }: Props) => {
  const { token } = useAuthStore();
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!token) {
    return (
      <header className="h-12 bg-bg-secondary border-b border-border flex items-center justify-between px-4">
        <Link to="/" className="font-mono text-accent-green text-sm tracking-[0.15em]">
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

  const [section, detail] = breadcrumb.includes("/") ? breadcrumb.split("/") : ["Dashboard", breadcrumb];

  return (
    <header className="h-12 bg-bg-secondary border-b border-border flex items-center justify-between px-4">
      <p className="text-sm">
        <span className="text-text-secondary">{section}</span>
        {detail ? (
          <>
            <span className="text-text-secondary"> / </span>
            <span className="text-text-primary">{detail}</span>
          </>
        ) : null}
      </p>
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs text-text-secondary">{clock}</span>
        <span className="flex items-center gap-2 text-xs text-text-secondary">
          <span className={`w-2 h-2 rounded-full ${wsConnected ? "bg-accent-green" : "bg-danger"}`} />
          {wsConnected ? "WS live" : "WS offline"}
        </span>
      </div>
    </header>
  );
};
