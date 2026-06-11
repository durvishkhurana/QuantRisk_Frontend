import { api } from "../api";

export type AggregateRisk = {
  total_portfolio_value: number;
  aggregate_var_95: number;
  portfolio_count: number;
  breakdown: {
    portfolio_id: string;
    name: string;
    value: number;
    var_95: number;
    var_pct_of_total: number;
    margin_status: string;
  }[];
  most_exposed_portfolio_id?: string | null;
  most_diversifying_portfolio_id?: string | null;
};

export const getAggregateRisk = async () => (await api.get<AggregateRisk>("/portfolios/aggregate")).data;
