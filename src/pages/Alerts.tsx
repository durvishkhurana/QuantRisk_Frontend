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
import { resolveWebSocketBase } from "../lib/apiBase";
import { ShapWaterfall } from "../components/risk/ShapWaterfall";
import { Button } from "../components/ui/button";

const PAGE_SIZE = 20;

const EVENT_TYPE_OPTIONS: { value: AlertEventType; label: string }[] = [
  { value: "MARGIN_WARNING", label: "Margin warning" },
  { value: "MARGIN_BREACH", label: "Margin breach" },
  { value: "CORRELATION_ALERT", label: "Correlation alert" },
];

const badgeClass = (eventType: string) => {
  if (eventType === "BREACH" || eventType === "MARGIN_BREACH") return "bg-danger/10 text-danger border-danger/20";
  if (eventType === "WARNING" || eventType === "MARGIN_WARNING") return "bg-warning/10 text-warning border-warning/20";
  if (eventType === "CORRELATION_ALERT") return "bg-amber-600/10 text-amber-400 border-amber-600/20";
  return "bg-bg-tertiary text-text-secondary border-white/[0.04]";
};

const badgeLabel = (eventType: string) => {
  if (eventType === "BREACH" || eventType === "MARGIN_BREACH") return "BREACH";
  if (eventType === "WARNING" || eventType === "MARGIN_WARNING") return "WARNING";
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
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/[0.04]">
          <div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight font-sans">Risk Alerts Ticker</h2>
            <p className="text-text-muted text-[11px] uppercase tracking-wider mt-1">Real-time alerts stream and acknowledgment history</p>
          </div>
          <div className="flex gap-2">
            {tickerItems[0] ? (
              <Button
                variant="outline"
                className="py-1 px-3 text-[10px]"
                onClick={() => setHighlightId(tickerItems[0].id)}
              >
                Test Alert Flash
              </Button>
            ) : null}
            <Button
              variant="outline"
              onClick={onExport}
              disabled={exporting}
              className="py-1 px-4 text-[10px]"
            >
              {exporting ? "Exporting…" : "Export CSV"}
            </Button>
          </div>
        </div>

        <AlertFeed items={tickerItems} highlightId={highlightId} />

        <div className="gold-panel p-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4 border border-accent-gold/10 bg-[#070b13]/60 shadow-lg shadow-black/25">
          <label className="flex flex-col gap-1 text-[9px] uppercase tracking-wider font-semibold text-text-muted">
            Portfolio Fund
            <select
              className="bg-[#05070c] border border-white/[0.06] rounded px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-gold/40"
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
          <label className="flex flex-col gap-1 text-[9px] uppercase tracking-wider font-semibold text-text-muted">
            From date
            <input
              type="date"
              className="bg-[#05070c] border border-white/[0.06] rounded px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-gold/40"
              value={fromDate}
              onChange={(e) => {
                setPage(1);
                setFromDate(e.target.value);
              }}
            />
          </label>
          <label className="flex flex-col gap-1 text-[9px] uppercase tracking-wider font-semibold text-text-muted">
            To date
            <input
              type="date"
              className="bg-[#05070c] border border-white/[0.06] rounded px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-gold/40"
              value={toDate}
              onChange={(e) => {
                setPage(1);
                setToDate(e.target.value);
              }}
            />
          </label>
          <div className="flex flex-col gap-2 text-[9px] uppercase tracking-wider font-semibold text-text-muted">
            Event type
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1.5">
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <label key={opt.value} className="inline-flex items-center gap-1.5 text-text-secondary text-[10px] font-sans lowercase font-semibold first-letter:uppercase">
                  <input
                    type="checkbox"
                    className="accent-accent-gold rounded border-white/10"
                    checked={selectedTypes.includes(opt.value)}
                    onChange={() => toggleType(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto terminal-card shadow-md shadow-black/20">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-white/[0.04] bg-bg-secondary">
                <th className="w-8 py-2.5 px-2" aria-label="Expand" />
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Portfolio Fund</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="text-right py-2.5 px-3">VaR at event</th>
                <th className="py-2.5 px-3">Message</th>
                <th className="py-2.5 px-3">Acknowledge</th>
                <th className="text-right py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-text-muted font-semibold">
                    Syncing risk log events…
                  </td>
                </tr>
              ) : null}
              {!isLoading && (alertsPage?.items.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-text-muted font-semibold">
                    No matching alert events in firm logs.
                  </td>
                </tr>
              ) : null}
              {(alertsPage?.items ?? []).map((row) => {
                const isExpanded = expandedIds.has(row.id);
                return (
                  <Fragment key={row.id}>
                    <tr className="h-12 hover:bg-bg-tertiary/40 align-middle transition-colors">
                      <td className="px-2 text-center">
                        <button
                          type="button"
                          className="text-text-muted hover:text-accent-gold p-1"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? "Collapse alert details" : "Expand alert details"}
                          onClick={() => toggleExpanded(row.id)}
                        >
                          <motion.span
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="inline-flex"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </motion.span>
                        </button>
                      </td>
                      <td className="px-3 font-mono text-[10px] text-text-muted whitespace-nowrap">
                        {new Date(row.triggered_at).toLocaleString()}
                      </td>
                      <td className="px-3 text-text-primary font-semibold">{row.portfolio_name}</td>
                      <td className="px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-wider font-mono border ${badgeClass(row.event_type)}`}
                        >
                          {badgeLabel(row.event_type)}
                        </span>
                      </td>
                      <td className="px-3 text-right font-mono text-text-primary font-semibold">
                        ${Math.round(Number(row.var_95)).toLocaleString()}
                      </td>
                      <td className="px-3 text-text-secondary text-xs max-w-xs truncate" title={row.message}>{row.message}</td>
                      <td className="px-3 text-xs">
                        {row.acknowledged ? (
                          <span className="text-accent-green font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-text-muted flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-3 text-right">
                        {!row.acknowledged ? (
                          <button
                            type="button"
                            className="text-[10px] text-accent-cyan hover:text-blue-400 font-bold uppercase tracking-wider disabled:opacity-50"
                            disabled={acknowledgeMutation.isPending}
                            onClick={() => acknowledgeMutation.mutate(row.id)}
                          >
                            Acknowledge
                          </button>
                        ) : (
                          <span className="text-[10px] text-text-muted font-mono">
                            {row.acknowledged_at ? new Date(row.acknowledged_at).toLocaleDateString() : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                    <AnimatePresence initial={false}>
                      {isExpanded ? (
                        <tr className="border-b border-white/[0.04]">
                          <td colSpan={8} className="p-0">
                            <motion.div
                              key={`detail-${row.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden bg-[#070b13]/60 border-y border-white/[0.02]"
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
          <p className="text-text-muted text-[10px] uppercase tracking-wider font-semibold">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="py-1 px-3 text-[10px]"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="py-1 px-3 text-[10px]"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
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
    <div className="px-6 py-5 space-y-4 font-sans border-l-2 border-accent-gold/40">
      {isLoading ? <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Syncing risk metrics snapshot at event time…</p> : null}
      {isError ? <p className="text-[10px] uppercase tracking-wider text-danger font-semibold">Could not load alert risk snapshots.</p> : null}
      {data ? (
        <>
          <p className="text-xs text-text-secondary leading-relaxed">
            Portfolio limit breach snapshot: reached <span className="text-text-primary font-mono font-bold">{utilPct}%</span> of the margin limit.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-[#05070c] border border-white/[0.04] p-4 rounded shadow-inner">
              <p className="text-[9px] uppercase text-text-muted mb-1 font-semibold">VaR 95 (at event)</p>
              <p className="font-mono text-base font-semibold text-text-primary">${Math.round(Number(data.var_95)).toLocaleString()}</p>
            </div>
            <div className="bg-[#05070c] border border-white/[0.04] p-4 rounded shadow-inner">
              <p className="text-[9px] uppercase text-text-muted mb-1 font-semibold">CVaR 95 (at event)</p>
              <p className="font-mono text-base font-semibold text-text-primary">
                {data.cvar_95 != null ? `$${Math.round(Number(data.cvar_95)).toLocaleString()}` : "—"}
              </p>
            </div>
            <div className="bg-[#05070c] border border-white/[0.04] p-4 rounded shadow-inner border-l-2 border-danger/45">
              <p className="text-[9px] uppercase text-text-muted mb-1 font-semibold">Stress Loss (Moderate)</p>
              <p className="font-mono text-base font-semibold text-danger">
                {data.stress_loss_moderate != null
                  ? `$${Math.round(Number(data.stress_loss_moderate)).toLocaleString()}`
                  : "—"}
              </p>
            </div>
          </div>
          
          <div className="bg-[#05070c] border border-white/[0.04] p-4 rounded shadow-inner">
            <p className="text-[9px] uppercase text-text-muted mb-3 font-semibold">Risk Attribution Contributors (Top 3)</p>
            <ShapWaterfall items={topShap} maxItems={3} height={160} />
            {data.risk_computed_at ? (
              <p className="text-[8px] text-text-muted mt-3 font-mono uppercase tracking-wider">
                Risk Engine Calculation Timestamp: {new Date(data.risk_computed_at).toLocaleString()}
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
  const streamIdsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    onActivityRef.current = onActivity;
  }, [onActivity]);

  useEffect(() => {
    if (!portfolioIds.length) return;

    const wsBase = resolveWebSocketBase();
    const token = localStorage.getItem("qr_token") ?? "";
    let closed = false;
    const sockets: WebSocket[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];

    const connect = (portfolioId: string) => {
      if (closed) return;
      // Resume from the last seen stream id so a reconnect replays events that
      // arrived while the socket was down (not just "$" = new-from-now).
      const since = streamIdsRef.current[portfolioId] ?? "$";
      const ws = new WebSocket(
        `${wsBase}/ws/portfolios/${portfolioId}?since=${encodeURIComponent(since)}&token=${encodeURIComponent(token)}`,
      );
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as { stream_id?: string };
          if (message.stream_id) {
            streamIdsRef.current[portfolioId] = message.stream_id;
          }
        } catch {
          // ignore
        }
        onActivityRef.current();
      };
      ws.onclose = () => {
        if (!closed) {
          timers.push(setTimeout(() => connect(portfolioId), 2000));
        }
      };
      sockets.push(ws);
    };

    portfolioIds.forEach(connect);

    return () => {
      closed = true;
      timers.forEach(clearTimeout);
      sockets.forEach((ws) => ws.close());
    };
  }, [portfolioIds.join("|")]);
}
