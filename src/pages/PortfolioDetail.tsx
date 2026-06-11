import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
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

type RiskTab = "overview" | "monte-carlo" | "backtest";

export const PortfolioPage = () => {
  const { portfolioId } = useParams();
  const [ticker, setTicker] = useState("AAPL");
  const [quantity, setQuantity] = useState("10");
  const [purchasePrice, setPurchasePrice] = useState("100");
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [showBacktest, setShowBacktest] = useState(false);
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
  }, []);

  const { connected } = useMarginAlerts(portfolioId, onAlert);

  return (
    <AppShell breadcrumb={`Dashboard / ${details.data?.name ?? "Portfolio"}`} wsConnected={connected}>
      <section className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-text-primary text-xl font-semibold">{details.data?.name ?? "Portfolio"}</h2>
            <p className="text-text-secondary text-sm font-mono">
              Total Value: ${Math.round(details.data?.total_value ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-terminal bg-accent-green text-bg-primary text-sm font-semibold"
              onClick={() => compute.mutate()}
            >
              Compute Risk Now
            </button>
            <button
              className="px-4 py-2 rounded-terminal border border-border text-text-primary text-sm"
              onClick={() => setShowOptimizer((v) => !v)}
            >
              {showOptimizer ? "Hide Optimizer" : "Optimize Portfolio"}
            </button>
          </div>
        </div>

        {portfolioId && <RiskNarrative portfolioId={portfolioId} narrative={risk.data?.risk_narrative} />}

        <div className="risk-section-nav">
          <button type="button" className={riskTab === "overview" ? "active" : ""} onClick={() => setRiskTab("overview")}>
            Overview
          </button>
          <button
            type="button"
            className={riskTab === "monte-carlo" ? "active" : ""}
            onClick={() => setRiskTab("monte-carlo")}
          >
            Monte Carlo
          </button>
          <button
            type="button"
            className={riskTab === "backtest" ? "active" : ""}
            onClick={() => {
              setRiskTab("backtest");
              setShowBacktest(true);
            }}
          >
            Backtest
          </button>
        </div>

        {riskTab === "overview" && (
          <>
            {risk.data ? (
              <RiskMetricCard
                historicalVar={Number(risk.data.var_95)}
                monteCarloVar={mc ? Number(mc.var_95) : undefined}
                marginStatus={risk.data.margin_status}
              />
            ) : (
              <p className="muted">No risk computation yet.</p>
            )}
            <div className="grid md:grid-cols-2 gap-3">
              {risk.data ? (
                <MarginGauge
                  utilization={Number(risk.data.margin_utilization)}
                  marginLimit={Number(details.data?.margin_limit ?? 0.05)}
                />
              ) : null}
              <div className="terminal-card p-4">
                <h3 className="text-text-secondary text-[11px] uppercase tracking-wider mb-3">SHAP attribution</h3>
                <ShapWaterfall items={topShap} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <h3 className="text-text-secondary text-[11px] uppercase tracking-wider mb-2">VaR trend (30d)</h3>
                <VaRTrendChart history={history.data ?? []} />
              </div>
              <div className="terminal-card p-4">
                <h3 className="text-text-secondary text-[11px] uppercase tracking-wider mb-3">Stress scenarios</h3>
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

        {showOptimizer && portfolioId && <OptimizerPanel portfolioId={portfolioId} />}

        {(showBacktest || riskTab === "backtest") && portfolioId && <BacktestPanel portfolioId={portfolioId} />}

        <h3>Add Position</h3>
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            addPosition.mutate();
          }}
        >
          <input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} />
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <input value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
          <button className="btn" type="submit">
            Add
          </button>
        </form>
        <h3 className="text-text-primary text-sm font-semibold">Positions</h3>
        <PositionsTable positions={details.data?.positions ?? []} />
      </section>
    </AppShell>
  );
};
