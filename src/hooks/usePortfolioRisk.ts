import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export const usePortfolioRisk = (portfolioId?: string) =>
  useQuery({
    queryKey: ["risk", portfolioId],
    queryFn: async () => (await api.get(`/portfolios/${portfolioId}/risk`)).data as any,
    enabled: Boolean(portfolioId),
    retry: false,
  });

export const useRiskHistory = (portfolioId?: string, days = 30) =>
  useQuery({
    queryKey: ["risk-history", portfolioId, days],
    queryFn: async () => (await api.get(`/portfolios/${portfolioId}/risk/history?days=${days}`)).data as any[],
    enabled: Boolean(portfolioId),
    retry: false,
  });
