import axios from "axios";

const inferredBase =
  typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:8000` : "http://localhost:8000";
const API_BASE = import.meta.env.VITE_API_URL ?? inferredBase;

export const api = axios.create({
  baseURL: API_BASE,
});

export const setAuthToken = (token: string | null) => {
  if (!token) {
    delete api.defaults.headers.common.Authorization;
    return;
  }
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export type Portfolio = {
  portfolio_id: string;
  name: string;
  margin_limit: number;
  positions_count: number;
  total_value: number;
  latest_risk?: { margin_status: string; var_95: number } | null;
};
