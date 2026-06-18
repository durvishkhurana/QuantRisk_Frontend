import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api";
import { getCorrelation } from "../api/risk";
import { AppShell } from "../components/layout/AppShell";
import { PositionsTable } from "../components/portfolio/PositionsTable";
import { MarginGauge } from "../components/risk/MarginGauge";
import { useMarginAlerts } from "../hooks/useMarginAlerts";
import { BacktestPanel } from "../components/risk/BacktestPanel";
import { CorrelationMatrix } from "../components/risk/CorrelationMatrix";
import { MonteCarloPanel } from "../components/risk/MonteCarloPanel";
import { OptimizerPanel } from "../components/risk/OptimizerPanel";
import { RiskMetricCard } from "../components/risk/RiskMetricCard";
import { RiskNarrative } from "../components/risk/RiskNarrative";
import { ShapWaterfall } from "../components/risk/ShapWaterfall";
import { StressTestPanel } from "../components/risk/StressTestPanel";
import { VaRTrendChart } from "../components/risk/VaRTrendChart";
import { VolatilityForecastPanel } from "../components/risk/VolatilityForecastPanel";
import { usePortfolioRisk, useRiskHistory } from "../hooks/usePortfolioRisk";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { cn } from "../lib/utils";

type RiskTab = "overview" | "monte-carlo" | "backtest";

const tabClass = (active: boolean) =>
  cn(
    "px-4 py-2 text-sm rounded-lg border transition-colors",
    active
      ? "bg-bg-tertiary border-accent-cyan/40 text-text-primary"
      : "border-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
  );

export const PortfolioPage = () => {
  const { portfolioId } = useParams();
  const navigate = useNavigate();
  const [ticker, setTicker] = useState("AAPL");
  const [quantity, setQuantity] = useState("10");
  const [purchasePrice, setPurchasePrice] = useState("100");
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [riskTab, setRiskTab] = useState<RiskTab>("overview");
  const queryClient = useQueryClient();

  const details = useQuery({
    queryKey: ["portfolio", portfolioId],
    queryFn: async () => (await api.get(`/portfolios/${portfolioId}`)).data as any,
    enabled: Boolean(portfolioId),
  });
  const risk = usePortfolioRisk(portfolioId);
  const history = useRiskHistory(portfolioId, 30);
  const correlation = useQuery({
    queryKey: ["correlation", portfolioId],
    queryFn: () => getCorrelation(portfolioId!),
    enabled: Boolean(portfolioId),
    retry: false,
  });

  const addPosition = useMutation({
    mutationFn: async () =>
      api.post(`/portfolios/${portfolioId}/positions`, {
        ticker,
        quantity: Number(quantity),
        purchase_price: Number(purchasePrice),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      toast.success("Position added");
    },
    onError: () => toast.error("Could not add position"),
  });

  const deletePosition = useMutation({
    mutationFn: async (positionId: string) => api.delete(`/portfolios/${portfolioId}/positions/${positionId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      toast.success("Position removed");
    },
    onError: () => toast.error("Could not remove position"),
  });

  const deletePortfolio = useMutation({
    mutationFn: async () => api.delete(`/portfolios/${portfolioId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      toast.success("Portfolio deleted");
      navigate("/dashboard");
    },
    onError: () => toast.error("Could not delete portfolio"),
  });

  const compute = useMutation({
    mutationFn: async () => (await api.post(`/portfolios/${portfolioId}/risk/compute`)).data as { task_id: string },
    onSuccess: async ({ task_id }) => {
      const poll = async () => {
        const task = (await api.get(`/tasks/${task_id}`)).data;
        if (task.status === "SUCCESS") {
          await queryClient.invalidateQueries({ queryKey: ["risk", portfolioId] });
          await queryClient.invalidateQueries({ queryKey: ["risk-history", portfolioId, 30] });
          await queryClient.invalidateQueries({ queryKey: ["correlation", portfolioId] });
          await queryClient.invalidateQueries({ queryKey: ["portfolios"] });
          toast.success("Risk computation complete");
          return;
        }
        if (task.status === "FAILED") {
          toast.error(task.result?.error || "Computation failed");
          return;
        }
        setTimeout(poll, 1000);
      };
      setTimeout(poll, 600);
    },
    onError: () => toast.error("Could not start risk computation"),
  });

  const topShap = useMemo(() => risk.data?.shap_attribution ?? [], [risk.data]);
  const mc = risk.data?.monte_carlo;
  const var95Fraction =
    mc?.histogram?.length && risk.data?.portfolio_value
      ? -Number(risk.data.var_95) / Number(risk.data.portfolio_value)
      : undefined;

  const onAlert = useCallback((message: { event_type?: string; data?: unknown }) => {
    const payload = message.data as { type?: string } | undefined;
    const type = message.event_type ?? payload?.type;
    if (type === "margin_breach") toast.error("Margin breach event received");
    if (type === "margin_warning") toast("Margin warning event received");
    if (type === "CORRELATION_ALERT") toast.error("Correlation stress alert");
    queryClient.invalidateQueries({ queryKey: ["risk", portfolioId] });
    queryClient.invalidateQueries({ queryKey: ["alerts-summary"] });
  }, [portfolioId, queryClient]);

  const { connected } = useMarginAlerts(portfolioId, onAlert);

  const riskLoading = risk.isLoading || compute.isPending;

  return (
    <AppShell breadcrumb={`Dashboard / ${details.data?.name ?? "Portfolio"}`} wsConnected={connected}>
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-50 tracking-tight">{details.data?.name ?? "Portfolio"}</h1>
            <p className="text-text-secondary text-sm font-mono tabular-nums mt-1">
              Total value: ${Math.round(details.data?.total_value ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => compute.mutate()} disabled={compute.isPending}>
              {compute.isPending ? "Computing…" : "Compute Risk Now"}
            </Button>
            <Button variant="outline" onClick={() => setShowOptimizer((v) => !v)}>
              {showOptimizer ? "Hide Optimizer" : "Optimize Portfolio"}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm("Delete this portfolio and all its history?")) deletePortfolio.mutate();
              }}
            >
              Delete
            </Button>
          </div>
        </div>

        {portfolioId && <RiskNarrative portfolioId={portfolioId} narrative={risk.data?.risk_narrative} />}

        <div className="flex flex-wrap gap-2">
          <button type="button" className={tabClass(riskTab === "overview")} onClick={() => setRiskTab("overview")}>
            Overview
          </button>
          <button type="button" className={tabClass(riskTab === "monte-carlo")} onClick={() => setRiskTab("monte-carlo")}>
            Monte Carlo
          </button>
          <button type="button" className={tabClass(riskTab === "backtest")} onClick={() => setRiskTab("backtest")}>
            Backtest
          </button>
        </div>

        {riskTab === "overview" && (
          <>
            {riskLoading && !risk.data ? (
              <div className="grid md:grid-cols-3 gap-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
            ) : risk.data ? (
              <RiskMetricCard
                historicalVar={Number(risk.data.var_95)}
                monteCarloVar={mc ? Number(mc.var_95) : undefined}
                marginStatus={risk.data.margin_status}
              />
            ) : (
              <div className="terminal-card p-6 text-sm text-text-secondary">
                No risk computation yet. Add positions and click <strong className="text-text-primary">Compute Risk Now</strong>.
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {risk.data ? (
                <MarginGauge
                  utilization={Number(risk.data.margin_utilization)}
                  marginLimit={Number(details.data?.margin_limit ?? 0.05)}
                />
              ) : null}
              <div className="terminal-card p-4">
                <h2 className="text-xs uppercase tracking-widest text-text-muted mb-4">SHAP attribution</h2>
                <ShapWaterfall items={topShap} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-xs uppercase tracking-widest text-text-muted mb-2">VaR trend (30d)</h2>
                <VaRTrendChart history={history.data ?? []} />
              </div>
              <div className="terminal-card p-4">
                <h2 className="text-xs uppercase tracking-widest text-text-muted mb-4">Stress scenarios</h2>
                <StressTestPanel stress={risk.data?.stress_tests} />
              </div>
            </div>
            <CorrelationMatrix data={correlation.data} />
            {portfolioId && (
              <VolatilityForecastPanel
                portfolioId={portfolioId}
                historicalVar95={risk.data ? Number(risk.data.var_95) : undefined}
                volForecasts={risk.data?.vol_forecasts}
                adjustedVar95Portfolio={risk.data?.adjusted_var_95_portfolio}
              />
            )}
          </>
        )}

        {riskTab === "monte-carlo" && (
          <MonteCarloPanel
            histogram={mc?.histogram}
            var95Fraction={var95Fraction}
            skewness={mc?.skewness}
            kurtosis={mc?.kurtosis}
          />
        )}

        {riskTab === "backtest" && portfolioId && <BacktestPanel portfolioId={portfolioId} />}

        {showOptimizer && portfolioId && <OptimizerPanel portfolioId={portfolioId} />}

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-200">Add position</h2>
          <form
            className="flex flex-wrap gap-4 items-end"
            onSubmit={(e) => {
              e.preventDefault();
              addPosition.mutate();
            }}
          >
            <label className="flex flex-col gap-2 text-xs text-text-muted">
              Ticker
              <Input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} className="w-28 font-mono" />
            </label>
            <label className="flex flex-col gap-2 text-xs text-text-muted">
              Quantity
              <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-28 font-mono tabular-nums" />
            </label>
            <label className="flex flex-col gap-2 text-xs text-text-muted">
              Purchase price
              <Input
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-32 font-mono tabular-nums"
              />
            </label>
            <Button type="submit" variant="outline">
              Add
            </Button>
          </form>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Positions</h2>
          <PositionsTable
            positions={details.data?.positions ?? []}
            onDelete={(id) => {
              if (window.confirm("Remove this position?")) deletePosition.mutate(id);
            }}
          />
        </div>
      </section>
    </AppShell>
  );
};
