import { api } from "../api";

export type OptimizationResult = {
  current_var_95: number;
  optimized_var_95: number;
  var_reduction_pct: number;
  rebalancing_actions: {
    ticker: string;
    current_weight: number;
    target_weight: number;
    action: "BUY" | "SELL" | "HOLD";
    delta_shares_approx: number;
  }[];
  efficient_frontier: { target_return: number; min_variance: number; weights?: number[] }[];
};

export type CorrelationRegime = {
  avg_correlation_30d: number;
  avg_correlation_252d: number;
  correlation_spike: number;
  regime: "NORMAL" | "ELEVATED" | "STRESS";
  most_correlated_pair: { ticker_a: string; ticker_b: string; correlation_30d: number };
  matrix_30d?: Record<string, Record<string, number>>;
};

export type KupiecResult = {
  total_days: number;
  expected_violations: number;
  actual_violations: number;
  violation_rate: number;
  kupiec_lr_statistic: number | null;
  model_valid: boolean | null;
  calibration: string;
  violation_dates: string[];
  series: { date: string; var_95: number; violated: boolean }[];
  message?: string | null;
};

export const getOptimization = async (portfolioId: string) =>
  (await api.get<OptimizationResult>(`/portfolios/${portfolioId}/risk/optimize`)).data;

export const getCorrelation = async (portfolioId: string) =>
  (await api.get<CorrelationRegime>(`/portfolios/${portfolioId}/risk/correlation`)).data;

export const getBacktest = async (portfolioId: string, days = 252) =>
  (await api.get<KupiecResult>(`/portfolios/${portfolioId}/risk/backtest`, { params: { days } })).data;
