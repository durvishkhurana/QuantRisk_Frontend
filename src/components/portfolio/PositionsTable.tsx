import { useState } from "react";
import { Input } from "../ui/input";

type PositionRow = {
  position_id: string;
  ticker: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  market_value: number;
};

type Props = {
  positions: PositionRow[];
  onDelete?: (positionId: string) => void;
  onEdit?: (positionId: string, quantity: number, purchasePrice: number) => Promise<void> | void;
};

export const PositionsTable = ({ positions, onDelete, onEdit }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (p: PositionRow) => {
    setEditingId(p.position_id);
    setEditQty(String(p.quantity));
    setEditPrice(String(p.purchase_price));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = async (positionId: string) => {
    if (!onEdit) return;
    try {
      setSaving(true);
      await onEdit(positionId, Number(editQty), Number(editPrice));
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-x-auto terminal-card shadow-md shadow-black/20">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-white/[0.04] bg-bg-secondary">
            <th className="py-2.5 px-4">Ticker</th>
            <th className="text-right py-2.5 px-4">Qty</th>
            <th className="text-right py-2.5 px-4">Cost basis</th>
            <th className="text-right py-2.5 px-4">Current Price</th>
            <th className="text-right py-2.5 px-4">Value</th>
            <th className="text-right py-2.5 px-4">P&amp;L</th>
            <th className="text-right py-2.5 px-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.03]">
          {positions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-text-muted text-xs">
                No positions yet. Add a ticker on the left, or retry loading if you expected holdings here.
              </td>
            </tr>
          ) : null}
          {positions.map((p) => {
            const isEditing = editingId === p.position_id;
            const pnl = (Number(p.current_price) - Number(p.purchase_price)) * Number(p.quantity);
            
            return (
              <tr key={p.position_id} className="h-11 hover:bg-bg-tertiary/40 transition-colors align-middle">
                <td className="px-4 font-mono text-accent-cyan font-bold tracking-wider">{p.ticker}</td>
                <td className="px-4 text-right font-mono text-text-primary">
                  {isEditing ? (
                    <Input
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      className="w-16 h-7 px-1.5 py-0.5 text-right ml-auto"
                    />
                  ) : (
                    p.quantity
                  )}
                </td>
                <td className="px-4 text-right font-mono text-text-primary">
                  {isEditing ? (
                    <Input
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-20 h-7 px-1.5 py-0.5 text-right ml-auto"
                    />
                  ) : (
                    `$${Number(p.purchase_price).toFixed(2)}`
                  )}
                </td>
                <td className="px-4 text-right font-mono text-text-muted">
                  ${Number(p.current_price).toFixed(2)}
                </td>
                <td className="px-4 text-right font-mono text-text-primary font-semibold">
                  ${Math.round(p.market_value).toLocaleString()}
                </td>
                <td className={`px-4 text-right font-mono font-semibold ${pnl >= 0 ? "text-accent-green" : "text-danger"}`}>
                  {pnl >= 0 ? "+" : ""}
                  ${Math.round(pnl).toLocaleString()}
                </td>
                <td className="px-4 text-right font-sans">
                  <div className="flex gap-3 justify-end items-center">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          disabled={saving}
                          className="text-accent-gold hover:text-amber-300 font-semibold disabled:opacity-50"
                          onClick={() => handleSave(p.position_id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="text-text-muted hover:text-white"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {onEdit && (
                          <button
                            type="button"
                            className="text-text-muted hover:text-accent-gold p-1"
                            onClick={() => startEdit(p)}
                            title="Edit Position"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            className="text-text-muted hover:text-danger p-1"
                            onClick={() => onDelete(p.position_id)}
                            title="Delete Position"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
