import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../api";
import { Button } from "../ui/button";

type Props = {
  portfolioId: string;
  narrative?: string | null;
};

export const RiskNarrative = ({ portfolioId, narrative }: Props) => {
  const queryClient = useQueryClient();
  const regenerate = useMutation({
    mutationFn: async () =>
      (await api.post(`/portfolios/${portfolioId}/risk/narrative`)).data as {
        risk_narrative: string;
        source: "anthropic" | "template";
      },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["risk", portfolioId] });
      if (data.source === "template") {
        toast("Summary generated from risk metrics (set ANTHROPIC_API_KEY on the API for Claude).", {
          icon: "ℹ️",
        });
      } else {
        toast.success("AI narrative updated");
      }
    },
    onError: () => toast.error("Could not generate narrative — run Compute Risk first"),
  });

  return (
    <div className="terminal-card p-5 border-l-2 border-accent-gold/40 bg-[#070b13]/60 shadow-lg shadow-black/25">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h3 className="text-xs uppercase tracking-wider font-bold text-text-primary flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-accent-gold animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM19.006 5.005L18.5 8l-.506-2.995L15 4.5l2.994-.505L18.5 1l.506 2.995L22 4.5l-2.994.505z" />
          </svg>
          Risk Summary Narrative
        </h3>
        <Button variant="outline" className="py-1 px-3 text-[10px]" onClick={() => regenerate.mutate()} disabled={regenerate.isPending}>
          {regenerate.isPending ? "Generating…" : "Regenerate Analysis"}
        </Button>
      </div>
      <p className="text-[10px] text-text-muted mb-2">
        Uses Claude when <span className="font-mono">ANTHROPIC_API_KEY</span> is set on the backend; otherwise a rule-based summary from VaR, SHAP, and stress tests.
      </p>
      {narrative ? (
        <p className="text-xs leading-relaxed text-text-secondary font-sans">{narrative}</p>
      ) : (
        <div className="space-y-2 py-2">
          <div className="h-2.5 w-full bg-white/[0.03] rounded animate-pulse" />
          <div className="h-2.5 w-5/6 bg-white/[0.03] rounded animate-pulse" />
          <div className="h-2.5 w-4/6 bg-white/[0.03] rounded animate-pulse" />
        </div>
      )}
    </div>
  );
};
