import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, Portfolio } from "../api";
import { AppShell } from "../components/layout/AppShell";
import { PortfolioCard } from "../components/portfolio/PortfolioCard";

export const DashboardPage = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [marginLimit, setMarginLimit] = useState("0.05");
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => (await api.get("/portfolios/")).data as Portfolio[],
  });
  const createMutation = useMutation({
    mutationFn: async (e: FormEvent) => {
      e.preventDefault();
      await api.post("/portfolios/", { name, margin_limit: Number(marginLimit) });
    },
    onSuccess: async () => {
      setName("");
      await queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      toast.success("Portfolio created");
    },
  });
  return (
    <AppShell breadcrumb="Dashboard">
      <section className="max-w-6xl mx-auto space-y-4">
        <h2 className="text-text-primary text-lg font-semibold">Portfolios</h2>
        <form className="flex flex-wrap gap-2" onSubmit={createMutation.mutate}>
          <input
            className="bg-bg-tertiary border border-border rounded-terminal px-3 py-2 text-sm text-text-primary"
            placeholder="Portfolio name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="bg-bg-tertiary border border-border rounded-terminal px-3 py-2 text-sm font-mono text-text-primary w-36"
            placeholder="Margin limit"
            value={marginLimit}
            onChange={(e) => setMarginLimit(e.target.value)}
          />
          <button className="px-4 py-2 rounded-terminal bg-accent-green text-bg-primary text-sm font-semibold" type="submit">
            Create
          </button>
        </form>
        {isError ? (
          <div className="terminal-panel p-4 text-sm space-y-2">
            <p className="text-danger">Could not load portfolios from the API.</p>
            <p className="text-text-secondary font-mono text-xs break-all">
              {error instanceof Error ? error.message : "Request failed — check login and VITE_API_URL."}
            </p>
            <button
              type="button"
              className="px-3 py-1.5 rounded-terminal border border-border text-text-primary text-sm hover:border-accent-cyan"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <p className="text-text-muted text-sm">Loading…</p>
        ) : data?.length === 0 ? (
          <p className="text-text-muted text-sm">No portfolios yet. Create one above or run the backend seed script.</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {data?.map((p) => (
              <PortfolioCard key={p.portfolio_id} portfolio={p} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
};
