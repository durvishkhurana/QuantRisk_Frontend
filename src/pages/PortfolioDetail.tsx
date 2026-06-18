import { useCallback, useMemo, useState } from "react";
import axios from "axios";
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
    "px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded border transition-colors",
    active
      ? "bg-bg-tertiary border-accent-gold/25 text-accent-gold shadow-gold"
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
  
  // Portfolio settings edit state
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [editPortName, setEditPortName] = useState("");
  const [editPortLimit, setEditPortLimit] = useState("");

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
      setTicker("");
      setQuantity("10");
      setPurchasePrice("100");
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.error("That ticker is already in this portfolio");
        return;
      }
      toast.error("Could not add position");
    },
  });

  const deletePosition = useMutation({
    mutationFn: async (positionId: string) => api.delete(`/portfolios/${portfolioId}/positions/${positionId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      toast.success("Position removed");
    },
    onError: () => toast.error("Could not remove position"),
  });

  const patchPosition = useMutation({
    mutationFn: async ({ positionId, quantity, purchasePrice }: { positionId: string; quantity: number; purchasePrice: number }) =>
      api.patch(`/portfolios/${portfolioId}/positions/${positionId}`, {
        quantity,
        purchase_price: purchasePrice,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      toast.success("Position updated");
    },
    onError: () => toast.error("Could not update position"),
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

  const patchPortfolio = useMutation({
    mutationFn: async () =>
      api.patch(`/portfolios/${portfolioId}`, {
        name: editPortName,
        margin_limit: Number(editPortLimit),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      await queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      setIsEditingPortfolio(false);
      toast.success("Portfolio settings updated");
    },
    onError: () => toast.error("Could not update portfolio settings"),
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

  const openEditModal = () => {
    if (details.data) {
      setEditPortName(details.data.name);
      setEditPortLimit(String(details.data.margin_limit));
      setIsEditingPortfolio(true);
    }
  };

  const riskLoading = risk.isLoading || compute.isPending;

  return (
    <AppShell breadcrumb={`Dashboard / ${details.data?.name ?? "Portfolio"}`} wsConnected={connected}>
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/[0.04]">
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight font-sans">
              {details.data?.name ?? "Portfolio"}
            </h1>
            <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest mt-1">
              Assets Value: <span className="text-text-primary font-semibold">${Math.round(details.data?.total_value ?? 0).toLocaleString()}</span>
              {" | "} Limit: <span className="text-accent-gold font-semibold">{(Number(details.data?.margin_limit ?? 0.05) * 100).toFixed(1)}%</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => compute.mutate()} disabled={compute.isPending}>
              {compute.isPending ? "Computing…" : "Compute Risk"}
            </Button>
            <Button variant="outline" onClick={() => setShowOptimizer((v) => !v)}>
              {showOptimizer ? "Hide Optimizer" : "Optimize"}
            </Button>
            <Button variant="outline" onClick={openEditModal}>
              Edit settings
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm("Delete this portfolio and all its history?")) deletePortfolio.mutate();
              }}
            >
              Delete Fund
            </Button>
          </div>
        </div>

        {portfolioId && <RiskNarrative portfolioId={portfolioId} narrative={risk.data?.risk_narrative} />}

        <div className="flex gap-1.5 border-b border-white/[0.04] pb-px">
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
          <div className="space-y-6">
            {riskLoading && !risk.data ? (
              <div className="grid md:grid-cols-2 gap-4">
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
              <div className="terminal-card p-6 text-xs text-text-secondary">
                No risk computation records found. Populate holdings and click <strong className="text-text-primary">Compute Risk</strong> to start.
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
              {risk.data ? (
                <MarginGauge
                  utilization={Number(risk.data.margin_utilization)}
                  marginLimit={Number(details.data?.margin_limit ?? 0.05)}
                />
              ) : null}
              <div className="terminal-card p-5">
                <h2 className="text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-4">SHAP Attribution</h2>
                <ShapWaterfall items={topShap} />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-2">VaR Trend (30d)</h2>
                <VaRTrendChart history={history.data ?? []} />
              </div>
              <div className="terminal-card p-5">
                <h2 className="text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-4">Stress Scenarios</h2>
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
          </div>
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

        {details.isError ? (
          <div className="terminal-card p-4 border border-danger/40 bg-danger/5 text-xs text-text-secondary">
            <p className="text-danger font-semibold mb-1">Could not load portfolio holdings</p>
            <p className="text-text-muted mb-3">
              The API request failed (network, timeout, or server error). Holdings stay empty until this succeeds.
            </p>
            <Button type="button" variant="outline" onClick={() => details.refetch()}>
              Retry
            </Button>
          </div>
        ) : null}

        <div className="grid md:grid-cols-[1fr_2fr] gap-6 pt-4 border-t border-white/[0.04]">
          <div className="space-y-4 bg-[#070b13] p-5 rounded border border-white/[0.04]">
            <h2 className="text-xs uppercase tracking-wider font-bold text-text-primary">Add Position</h2>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                addPosition.mutate();
              }}
            >
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-semibold text-text-muted">Ticker Symbol</span>
                <Input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} className="w-full" required />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-semibold text-text-muted">Quantity</span>
                <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full" required />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-semibold text-text-muted">Purchase Cost basis</span>
                <Input
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <Button type="submit" variant="default" disabled={addPosition.isPending} className="w-full mt-2">
                {addPosition.isPending ? "Adding…" : "Add Position"}
              </Button>
            </form>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-wider font-bold text-text-primary">Current Holdings</h2>
            <PositionsTable
              positions={details.data?.positions ?? []}
              onDelete={(id) => {
                if (window.confirm("Remove this position?")) deletePosition.mutate(id);
              }}
              onEdit={async (id, qty, price) => {
                await patchPosition.mutateAsync({ positionId: id, quantity: qty, purchasePrice: price });
              }}
            />
          </div>
        </div>

        {/* Edit Portfolio Settings Modal */}
        {isEditingPortfolio && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="w-full max-w-[400px] gold-panel p-6 border border-accent-gold/20 bg-[#0a0e14] shadow-2xl">
              <h3 className="text-text-primary text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-white/[0.04]">Portfolio Settings</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  patchPortfolio.mutate();
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-text-muted font-semibold">Fund Name</label>
                  <Input value={editPortName} onChange={(e) => setEditPortName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-text-muted font-semibold">Margin Limit (VaR Cap %)</label>
                  <Input value={editPortLimit} onChange={(e) => setEditPortLimit(e.target.value)} required />
                </div>
                <div className="flex gap-2 justify-end pt-3 border-t border-white/[0.04]">
                  <Button type="button" variant="ghost" onClick={() => setIsEditingPortfolio(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={patchPortfolio.isPending}>
                    {patchPortfolio.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
};
