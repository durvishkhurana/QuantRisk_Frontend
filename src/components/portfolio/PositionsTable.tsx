type PositionRow = {
  position_id: string;
  ticker: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  market_value: number;
};

export const PositionsTable = ({
  positions,
  onDelete,
}: {
  positions: PositionRow[];
  onDelete?: (positionId: string) => void;
}) => (
  <div className="overflow-x-auto terminal-card">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-[11px] uppercase tracking-wider text-text-muted border-b border-border">
          <th className="text-left py-2 px-3">Ticker</th>
          <th className="text-right py-2 px-3">Qty</th>
          <th className="text-right py-2 px-3">Price</th>
          <th className="text-right py-2 px-3">Value</th>
          <th className="text-right py-2 px-3">P&amp;L</th>
          {onDelete ? <th className="text-right py-2 px-3">Actions</th> : null}
        </tr>
      </thead>
      <tbody>
        {positions.map((p) => {
          const pnl = (Number(p.current_price) - Number(p.purchase_price)) * Number(p.quantity);
          return (
            <tr key={p.position_id} className="h-10 border-b border-bg-secondary hover:bg-bg-tertiary">
              <td className="px-3 font-mono text-accent-cyan font-semibold">{p.ticker}</td>
              <td className="px-3 text-right font-mono text-text-primary">{p.quantity}</td>
              <td className="px-3 text-right font-mono text-text-primary">${Number(p.current_price).toFixed(2)}</td>
              <td className="px-3 text-right font-mono text-text-primary">
                ${Math.round(p.market_value).toLocaleString()}
              </td>
              <td className={`px-3 text-right font-mono ${pnl >= 0 ? "text-accent-green" : "text-danger"}`}>
                {pnl >= 0 ? "+" : ""}
                ${Math.round(pnl).toLocaleString()}
              </td>
              {onDelete ? (
                <td className="px-3 text-right">
                  <button
                    type="button"
                    className="text-text-muted hover:text-text-primary text-xs"
                    onClick={() => onDelete(p.position_id)}
                  >
                    Delete
                  </button>
                </td>
              ) : null}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
