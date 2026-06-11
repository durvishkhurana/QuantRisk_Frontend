import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { api, Portfolio } from "../api";
import {
  AlertEvent,
  AlertEventType,
  AlertListParams,
  acknowledgeAlert,
  downloadAlertsCsv,
  fetchAlertDetail,
  fetchAlerts,
} from "../api/alerts";
import { AlertFeed, AlertItem } from "../components/alerts/AlertFeed";
import { AppShell } from "../components/layout/AppShell";
import { ShapWaterfall } from "../components/risk/ShapWaterfall";

const PAGE_SIZE = 20;

const EVENT_TYPE_OPTIONS: { value: AlertEventType; label: string }[] = [
  { value: "MARGIN_WARNING", label: "Margin warning" },
  { value: "MARGIN_BREACH", label: "Margin breach" },
  { value: "CORRELATION_ALERT", label: "Correlation alert" },
];

const badgeClass = (eventType: string) => {
  if (eventType === "BREACH") return "bg-danger/20 text-danger border-danger/40";
  if (eventType === "WARNING") return "bg-warning/20 text-warning border-warning/40";
  if (eventType === "CORRELATION_ALERT") return "bg-orange-500/20 text-orange-400 border-orange-500/40";
  return "bg-bg-tertiary text-text-secondary border-border";
};

const badgeLabel = (eventType: string) => {
  if (eventType === "BREACH") return "BREACH";
  if (eventType === "WARNING") return "WARNING";
  if (eventType === "CORRELATION_ALERT") return "CORRELATION";
  return eventType;
};

const alertsQueryKey = (params: AlertListParams) => ["alerts", params] as const;

export const AlertsPage = () => {
  const queryClient = useQueryClient();
  const [highlightId, setHighlightId] = useState<string | undefined>();
  const [portfolioFilter, setPortfolioFilter] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<AlertEventType[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const toggleExpanded = (eventId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const listParams = useMemo<AlertListParams>(
    () => ({
      portfolio_id: portfolioFilter || undefined,
      event_type: selectedTypes.length ? selectedTypes : undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    [portfolioFilter, selectedTypes, fromDate, toDate, page],
  );

  const exportParams = useMemo(
    () => ({
      portfolio_id: portfolioFilter || undefined,
      event_type: selectedTypes.length ? selectedTypes : undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    }),
    [portfolioFilter, selectedTypes, fromDate, toDate],
  );

  const { data: portfolios } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => (await api.get("/portfolios")).data as Portfolio[],
  });

  const portfolioIds = useMemo(() => (portfolios ?? []).map((p) => p.portfolio_id), [portfolios]);

  const invalidateAlertQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["alerts-summary"] });
    queryClient.invalidateQueries({ queryKey: ["alerts"] });
  }, [queryClient]);

  useAlertsLiveSockets(portfolioIds, invalidateAlertQueries);

  const { data: summary } = useQuery({
    queryKey: ["alerts-summary"],
    queryFn: async () => (await api.get("/alerts/summary")).data as any[],
    refetchInterval: 15_000,
  });

  const { data: alertsPage, isLoading, isFetching } = useQuery({
    queryKey: alertsQueryKey(listParams),
    queryFn: () => fetchAlerts(listParams),
    placeholderData: (prev) => prev,
  });

  const tickerItems: AlertItem[] = useMemo(
    () =>
      (summary ?? []).map((a, idx) => ({
        id: `${a.portfolio_id}-${idx}`,
        portfolio_name: a.portfolio_name,
        event_type: a.event_type,
        description: `${a.event_type} — utilization ${(a.utilization * 100).toFixed(1)}%`,
        triggered_at: a.triggered_at ? new Date(a.triggered_at).toLocaleString() : "—",
      })),
    [summary],
  );

  const acknowledgeMutation = useMutation({
    mutationFn: acknowledgeAlert,
    onMutate: async (eventId: string) => {
      await queryClient.cancelQueries({ queryKey: ["alerts"] });
      const snapshots = queryClient.getQueriesData<{ items: AlertEvent[]; total: number }>({ queryKey: ["alerts"] });
      snapshots.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.map((row) =>
            row.id === eventId
              ? { ...row, acknowledged: true, acknowledged_at: new Date().toISOString() }
              : row,
          ),
        });
      });
    },
    onError: () => {
      toast.error("Failed to acknowledge alert");
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
    onSuccess: () => {
      toast.success("Alert acknowledged");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const [exporting, setExporting] = useState(false);

  const onExport = async () => {
    try {
      setExporting(true);
      await downloadAlertsCsv(exportParams);
      toast.success("CSV downloaded");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const toggleType = (value: AlertEventType) => {
    setPage(1);
    setSelectedTypes((prev) => (prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]));
  };

  const total = alertsPage?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AppShell breadcrumb="Dashboard / Alerts">
      <section className="max-w-6xl mx-auto space-y-4">
        <div>
          <h2 className="text-text-primary text-lg font-semibold">Live alert feed</h2>
          <p className="text-text-secondary text-xs">Streaming updates from your portfolios</p>
        </div>
        <AlertFeed items={tickerItems} highlightId={highlightId} />
        {tickerItems[0] ? (
          <button
            type="button"
            className="text-xs text-accent-cyan"
            onClick={() => setHighlightId(tickerItems[0].id)}
          >
            Preview breach animation
          </button>
        ) : null}

        <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
          <div>
            <h2 className="text-text-primary text-lg font-semibold">Alert history</h2>
            <p className="text-text-secondary text-xs">
              {isFetching ? "Refreshing…" : `${total} event${total === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-terminal border border-border text-text-primary text-sm hover:border-accent-cyan disabled:opacity-50"
            onClick={onExport}
            disabled={exporting}
          >
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>

        <div className="terminal-card p-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            Portfolio
            <select
              className="bg-bg-tertiary border border-border rounded-terminal px-3 py-2 text-sm text-text-primary"
              value={portfolioFilter}
              onChange={(e) => {
                setPage(1);
                setPortfolioFilter(e.target.value);
              }}
            >
              <option value="">All portfolios</option>
              {(portfolios ?? []).map((p) => (
                <option key={p.portfolio_id} value={p.portfolio_id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            From date
            <input
              type="date"
              className="bg-bg-tertiary border border-border rounded-terminal px-3 py-2 text-sm text-text-primary"
              value={fromDate}
              onChange={(e) => {
                setPage(1);
                setFromDate(e.target.value);
              }}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            To date
            <input
              type="date"
              className="bg-bg-tertiary border border-border rounded-terminal px-3 py-2 text-sm text-text-primary"
              value={toDate}
              onChange={(e) => {
                setPage(1);
                setToDate(e.target.value);
              }}
            />
          </label>
          <div className="flex flex-col gap-2 text-xs text-text-muted">
            Event type
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <label key={opt.value} className="inline-flex items-center gap-1.5 text-text-secondary text-xs">
                  <input
                    type="checkbox"
                    className="accent-accent-cyan"
                    checked={selectedTypes.includes(opt.value)}
                    onChange={() => toggleType(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto terminal-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-text-muted border-b border-border">
                <th className="w-8 py-2 px-2" aria-label="Expand" />
                <th className="text-left py-2 px-3">Timestamp</th>
                <th className="text-left py-2 px-3">Portfolio</th>
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-right py-2 px-3">VaR at event</th>
                <th className="text-left py-2 px-3">Message</th>
                <th className="text-left py-2 px-3">Acknowledged</th>
                <th className="text-right py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-text-muted">
                    Loading alerts…
                  </td>
                </tr>
              ) : null}
              {!isLoading && (alertsPage?.items.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-text-muted">
                    No alerts match your filters.
                  </td>
                </tr>
              ) : null}
              {(alertsPage?.items ?? []).map((row) => {
                const isExpanded = expandedIds.has(row.id);
                return (
                  <Fragment key={row.id}>
                    <tr className="h-12 border-b border-bg-secondary hover:bg-bg-tertiary align-middle">
                      <td className="px-2 text-center">
                        <button
                          type="button"
                          className="text-text-muted hover:text-accent-cyan p-1"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? "Collapse alert details" : "Expand alert details"}
                          onClick={() => toggleExpanded(row.id)}
                        >
                          <motion.span
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="inline-block text-xs"
                          >
                            ▶
                          </motion.span>
                        </button>
                      </td>
                      <td className="px-3 font-mono text-[11px] text-text-muted whitespace-nowrap">
                        {new Date(row.triggered_at).toLocaleString()}
                      </td>
                      <td className="px-3 text-text-primary">{row.portfolio_name}</td>
                      <td className="px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeClass(row.event_type)}`}
                        >
                          {badgeLabel(row.event_type)}
                        </span>
                      </td>
                      <td className="px-3 text-right font-mono text-text-primary">
                        ${Math.round(Number(row.var_95)).toLocaleString()}
                      </td>
                      <td className="px-3 text-text-secondary text-xs max-w-md">{row.message}</td>
                      <td className="px-3 text-xs">
                        {row.acknowledged ? (
                          <span className="text-accent-green">Yes</span>
                        ) : (
                          <span className="text-text-muted">Pending</span>
                        )}
                      </td>
                      <td className="px-3 text-right">
                        {!row.acknowledged ? (
                          <button
                            type="button"
                            className="text-xs text-accent-cyan hover:underline disabled:opacity-50"
                            disabled={acknowledgeMutation.isPending}
                            onClick={() => acknowledgeMutation.mutate(row.id)}
                          >
                            Acknowledge
                          </button>
                        ) : (
                          <span className="text-[11px] text-text-muted font-mono">
                            {row.acknowledged_at ? new Date(row.acknowledged_at).toLocaleDateString() : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                    <AnimatePresence initial={false}>
                      {isExpanded ? (
                        <tr className="border-b border-bg-secondary">
                          <td colSpan={8} className="p-0">
                            <motion.div
                              key={`detail-${row.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.28, ease: "easeInOut" }}
                              className="overflow-hidden bg-bg-secondary/40"
                            >
                              <AlertDetailPanel eventId={row.id} marginUtilization={Number(row.margin_utilization)} />
                            </motion.div>
                          </td>
                        </tr>
                      ) : null}
                    </AnimatePresence>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-text-muted text-xs">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded-terminal border border-border text-text-primary text-xs disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-terminal border border-border text-text-primary text-xs disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
};

function AlertDetailPanel({ eventId, marginUtilization }: { eventId: string; marginUtilization: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["alert-detail", eventId],
    queryFn: () => fetchAlertDetail(eventId),
  });

  const topShap = useMemo(() => {
    const items = data?.shap_attributions ?? [];
    return [...items]
      .sort((a, b) => Math.abs(Number(b.contribution)) - Math.abs(Number(a.contribution)))
      .slice(0, 3)
      .map((x) => ({
        ticker: x.ticker,
        contribution: Number(x.contribution),
        pct_of_var: Number(x.pct_of_var ?? 0),
      }));
  }, [data?.shap_attributions]);

  const utilPct = (marginUtilization * 100).toFixed(1);

  return (
    <div className="px-4 py-4 space-y-4">
      {isLoading ? <p className="text-xs text-text-muted">Loading risk snapshot at event time…</p> : null}
      {isError ? <p className="text-xs text-danger">Could not load alert detail.</p> : null}
      {data ? (
        <>
          <p className="text-sm text-text-secondary">
            Portfolio was at <span className="text-text-primary font-mono">{utilPct}%</span> margin utilization when
            this event fired.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="terminal-card p-3">
              <p className="text-[10px] uppercase text-text-muted mb-1">VaR 95 (at event)</p>
              <p className="font-mono text-lg text-text-primary">${Math.round(Number(data.var_95)).toLocaleString()}</p>
            </div>
            <div className="terminal-card p-3">
              <p className="text-[10px] uppercase text-text-muted mb-1">CVaR 95 (at event)</p>
              <p className="font-mono text-lg text-text-primary">
                {data.cvar_95 != null ? `$${Math.round(Number(data.cvar_95)).toLocaleString()}` : "—"}
              </p>
            </div>
            <div className="terminal-card p-3">
              <p className="text-[10px] uppercase text-text-muted mb-1">Stress loss (moderate)</p>
              <p className="font-mono text-lg text-danger">
                {data.stress_loss_moderate != null
                  ? `$${Math.round(Number(data.stress_loss_moderate)).toLocaleString()}`
                  : "—"}
              </p>
            </div>
          </div>
          <div className="terminal-card p-3">
            <p className="text-[10px] uppercase text-text-muted mb-2">SHAP attribution (top 3)</p>
            <ShapWaterfall items={topShap} maxItems={3} height={160} />
            {data.risk_computed_at ? (
              <p className="text-[10px] text-text-muted mt-2 font-mono">
                Risk snapshot: {new Date(data.risk_computed_at).toLocaleString()}
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function useAlertsLiveSockets(portfolioIds: string[], onActivity: () => void) {
  const onActivityRef = useRef(onActivity);
  useEffect(() => {
    onActivityRef.current = onActivity;
  }, [onActivity]);

  useEffect(() => {
    if (!portfolioIds.length) return;

    const wsBase = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace("http", "ws");
    const sockets: WebSocket[] = [];

    portfolioIds.forEach((portfolioId) => {
      const ws = new WebSocket(`${wsBase}/ws/portfolios/${portfolioId}?since=$`);
      ws.onmessage = () => onActivityRef.current();
      sockets.push(ws);
    });

    return () => {
      sockets.forEach((ws) => ws.close());
    };
  }, [portfolioIds.join("|")]);
}
