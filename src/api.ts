import axios from "axios";
import { API_BASE } from "./lib/apiBase";

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
