import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, Portfolio } from "../api";
import { AppShell } from "../components/layout/AppShell";
import { PortfolioCard } from "../components/portfolio/PortfolioCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";

export const DashboardPage = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [marginLimit, setMarginLimit] = useState("0.05");
  
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => (await api.get("/portfolios")).data as Portfolio[],
  });

  const createMutation = useMutation({
    mutationFn: async (e: FormEvent) => {
      e.preventDefault();
      await api.post("/portfolios", { name, margin_limit: Number(marginLimit) });
    },
    onSuccess: async () => {
      setName("");
      await queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      toast.success("Portfolio created");
    },
    onError: () => toast.error("Could not create portfolio"),
  });

  return (
    <AppShell breadcrumb="Dashboard">
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/[0.04]">
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight font-sans">Active Portfolios</h1>
            <p className="text-text-muted text-[11px] uppercase tracking-wider mt-1">Manage investment portfolios &amp; set risk ceilings</p>
          </div>
          
          <form className="flex flex-wrap gap-3 items-end bg-[#070b13] p-4 rounded border border-white/[0.04]" onSubmit={createMutation.mutate}>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-wider font-semibold text-text-muted">Portfolio Name</span>
              <Input 
                placeholder="Global Equity Fund" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="min-w-[200px]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-wider font-semibold text-text-muted">Margin Limit (VaR Cap)</span>
              <Input
                placeholder="0.05"
                value={marginLimit}
                onChange={(e) => setMarginLimit(e.target.value)}
                className="w-32 font-mono"
                required
              />
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create Fund"}
            </Button>
          </form>
        </div>

        {isError ? (
          <div className="terminal-panel p-6 text-xs space-y-4 border border-danger/15 bg-danger/[0.02] rounded">
            <p className="text-danger font-semibold uppercase tracking-wider">Failed to sync portfolios from remote core.</p>
            <p className="text-text-muted font-mono break-all bg-black/45 p-3 rounded border border-white/[0.02]">
              {error instanceof Error ? error.message : "Request failed — check network connectivity and API keys."}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry Sync
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : data?.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/[0.05] rounded-lg bg-bg-secondary/20">
            <svg className="w-8 h-8 text-text-muted mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-semibold text-text-primary mb-1">No active portfolios</h3>
            <p className="text-text-muted text-xs max-w-sm mx-auto mb-4 font-sans leading-relaxed">
              Create your first risk-managed portfolio using the form on the right or initialize demo data.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data?.map((p) => (
              <PortfolioCard key={p.portfolio_id} portfolio={p} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
};
