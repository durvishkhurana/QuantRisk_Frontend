import { useEffect, useRef, useState } from "react";
import { resolveWebSocketBase } from "../lib/apiBase";

type StreamMessage = {
  stream_id: string;
  event_type: string;
  data: unknown;
  timestamp: string;
};

export const useMarginAlerts = (portfolioId?: string, onMessage?: (msg: StreamMessage) => void) => {
  const lastStreamId = useRef<string>("$");
  const isReconnect = useRef<boolean>(false);
  const onMessageRef = useRef(onMessage);
  const [connected, setConnected] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!portfolioId) return;

    const wsBase = resolveWebSocketBase();
    let ws: WebSocket | null = null;
    let closed = false;

    const connect = () => {
      if (closed) return;
      const sinceParam = isReconnect.current ? lastStreamId.current : "$";
      ws = new WebSocket(`${wsBase}/ws/portfolios/${portfolioId}?since=${encodeURIComponent(sinceParam)}`);

      ws.onopen = () => {
        setConnected(true);
        isReconnect.current = true;
      };

      ws.onclose = () => {
        setConnected(false);
        if (!closed) {
          reconnectTimer.current = setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => setConnected(false);

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as StreamMessage;
          if (message.stream_id) {
            lastStreamId.current = message.stream_id;
          }
          onMessageRef.current?.(message);
        } catch {
          // ignore malformed payloads
        }
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      ws?.close();
    };
  }, [portfolioId]);

  return { connected, lastStreamId: lastStreamId.current };
};
