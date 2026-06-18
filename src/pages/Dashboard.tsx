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
      <section className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold text-slate-50 tracking-tight">Portfolios</h1>
        <form className="flex flex-wrap gap-4 items-end" onSubmit={createMutation.mutate}>
          <label className="flex flex-col gap-2 text-xs text-text-muted">
            Name
            <Input placeholder="Portfolio name" value={name} onChange={(e) => setName(e.target.value)} className="min-w-[200px]" />
          </label>
          <label className="flex flex-col gap-2 text-xs text-text-muted">
            Margin limit
            <Input
              placeholder="0.05"
              value={marginLimit}
              onChange={(e) => setMarginLimit(e.target.value)}
              className="w-36 font-mono tabular-nums"
            />
          </label>
          <Button type="submit">Create</Button>
        </form>
        {isError ? (
          <div className="terminal-panel p-4 text-sm space-y-4">
            <p className="text-danger">Could not load portfolios from the API.</p>
            <p className="text-text-secondary font-mono text-xs break-all">
              {error instanceof Error ? error.message : "Request failed — check login and VITE_API_URL."}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
        ) : data?.length === 0 ? (
          <p className="text-text-muted text-sm">No portfolios yet. Create one above or run the backend seed script.</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.map((p) => (
              <PortfolioCard key={p.portfolio_id} portfolio={p} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
};
