import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api";
import { useAuthStore } from "../store";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

type AuthResponse = {
  token: string;
  email: string;
  user_id?: string;
};

export const AuthPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post(path, { email, password });
      return data as AuthResponse;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.email);
      if (mode === "register" && data.user_id) {
        toast.success("Account created");
        setRegisteredUserId(String(data.user_id));
        return;
      }
      setRegisteredUserId(null);
      navigate("/dashboard");
    },
    onError: () => toast.error("Authentication failed"),
  });

  const copyUserId = async () => {
    if (!registeredUserId) return;
    try {
      await navigator.clipboard.writeText(registeredUserId);
      toast.success("User ID copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    if (next === "login") setRegisteredUserId(null);
  };

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-b from-[#060a12] via-bg-primary to-bg-primary">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.03),_transparent_50%)] pointer-events-none" />
      <div className="w-full max-w-[400px] gold-panel p-8 relative z-10 border border-accent-gold/10 bg-[#070b13]/85 shadow-lg shadow-black/40">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="font-mono text-accent-gold text-xs tracking-[0.25em] font-bold">QR ENGINE</span>
          </div>
        </div>
        <h1 className="text-text-primary text-lg font-bold tracking-tight text-center mb-2">
          {mode === "login" ? "Institutional Access" : "Open Risk Account"}
        </h1>
        <p className="text-text-muted text-[10px] text-center uppercase tracking-widest mb-6">QuantRisk Engine Terminal</p>
        
        <div className="grid grid-cols-2 gap-1 p-1 bg-black/40 rounded border border-white/[0.04] mb-6">
          <button
            type="button"
            className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-150 ${
              mode === "login" ? "bg-bg-tertiary text-accent-gold shadow-sm shadow-black/10 border border-white/[0.02]" : "text-text-muted hover:text-text-primary"
            }`}
            onClick={() => switchMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-150 ${
              mode === "register" ? "bg-bg-tertiary text-accent-gold shadow-sm shadow-black/10 border border-white/[0.02]" : "text-text-muted hover:text-text-primary"
            }`}
            onClick={() => switchMode("register")}
          >
            Register
          </button>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-semibold text-text-muted">Security Email</label>
            <Input
              type="email"
              placeholder="analyst@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-semibold text-text-muted">Passphrase</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full mt-2 py-2.5"
          >
            {mutation.isPending ? "Authenticating…" : mode === "login" ? "Sign in to Terminal" : "Register Credentials"}
          </Button>
        </form>

        {registeredUserId ? (
          <div className="mt-6 rounded border border-accent-gold/15 bg-accent-gold/5 p-4 text-[11px] text-text-secondary">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-accent-gold">Account Created:</span>
              <code className="font-mono text-[10px] text-text-primary break-all bg-black/40 px-1.5 py-0.5 rounded border border-white/[0.03]">{registeredUserId}</code>
              <button
                type="button"
                className="ml-auto shrink-0 text-accent-gold hover:text-white underline font-semibold"
                onClick={copyUserId}
              >
                Copy ID
              </button>
            </div>
            <button
              type="button"
              className="mt-4 w-full py-2 rounded border border-accent-gold/20 text-accent-gold hover:bg-accent-gold/5 text-xs font-semibold uppercase tracking-wider transition-colors"
              onClick={() => navigate("/dashboard")}
            >
              Enter Dashboard
            </button>
          </div>
        ) : null}

        <p className="text-center mt-6">
          <Link to="/" className="text-text-muted hover:text-accent-gold text-[10px] uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Gateway
          </Link>
        </p>
      </div>
    </main>
  );
};
