import { api } from "../api";

export type AlertEventType = "MARGIN_WARNING" | "MARGIN_BREACH" | "CORRELATION_ALERT";

export type AlertEvent = {
  id: string;
  portfolio_id: string;
  portfolio_name: string;
  event_type: string;
  triggered_at: string;
  var_95: number;
  margin_limit: number;
  margin_utilization: number;
  message: string;
  acknowledged_at: string | null;
  acknowledged: boolean;
};

export type AlertsListResponse = {
  items: AlertEvent[];
  total: number;
  limit: number;
  offset: number;
};

export type AlertListParams = {
  portfolio_id?: string;
  event_type?: AlertEventType[];
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
};

const serializeParams = (params: AlertListParams): Record<string, string | number | string[]> => {
  const out: Record<string, string | number | string[]> = {};
  if (params.portfolio_id) out.portfolio_id = params.portfolio_id;
  if (params.from_date) out.from_date = params.from_date;
  if (params.to_date) out.to_date = params.to_date;
  if (params.limit != null) out.limit = params.limit;
  if (params.offset != null) out.offset = params.offset;
  if (params.event_type?.length) out.event_type = params.event_type;
  return out;
};

const axiosParamsConfig = { paramsSerializer: { indexes: null } as const };

export const fetchAlerts = async (params: AlertListParams) =>
  (
    await api.get<AlertsListResponse>("/alerts", {
      params: serializeParams(params),
      ...axiosParamsConfig,
    })
  ).data;

export const acknowledgeAlert = async (eventId: string) =>
  (await api.post<AlertEvent>(`/alerts/${eventId}/acknowledge`)).data;

export type AlertShapAttribution = {
  ticker: string;
  contribution: number;
  pct_of_var: number | null;
};

export type AlertDetail = AlertEvent & {
  cvar_95: number | null;
  shap_attributions: AlertShapAttribution[];
  stress_loss_moderate: number | null;
  risk_computed_at: string | null;
};

export const fetchAlertDetail = async (eventId: string) =>
  (await api.get<AlertDetail>(`/alerts/${eventId}/detail`)).data;

export const downloadAlertsCsv = async (params: Omit<AlertListParams, "limit" | "offset">) => {
  const response = await api.get("/alerts/export/csv", {
    params: serializeParams(params),
    responseType: "blob",
    ...axiosParamsConfig,
  });
  const blob = new Blob([response.data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `quantrisk-alerts-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
