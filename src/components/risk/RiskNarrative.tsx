import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api";
import { Button } from "../ui/button";

type Props = {
  portfolioId: string;
  narrative?: string | null;
};

export const RiskNarrative = ({ portfolioId, narrative }: Props) => {
  const queryClient = useQueryClient();
  const regenerate = useMutation({
    mutationFn: async () => (await api.post(`/portfolios/${portfolioId}/risk/compute`)).data as { task_id: string },
    onSuccess: async ({ task_id }) => {
      const poll = async () => {
        const task = (await api.get(`/tasks/${task_id}`)).data;
        if (task.status === "SUCCESS") {
          await queryClient.invalidateQueries({ queryKey: ["risk", portfolioId] });
          return;
        }
        if (task.status !== "FAILED") setTimeout(poll, 1000);
      };
      setTimeout(poll, 600);
    },
  });

  return (
    <div className="terminal-card p-5 border-l-2 border-accent-gold/40 bg-[#070b13]/60 shadow-lg shadow-black/25">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h3 className="text-xs uppercase tracking-wider font-bold text-text-primary flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-accent-gold animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM19.006 5.005L18.5 8l-.506-2.995L15 4.5l2.994-.505L18.5 1l.506 2.995L22 4.5l-2.994.505z" />
          </svg>
          AI Risk Attributions Narrative
        </h3>
        <Button variant="outline" className="py-1 px-3 text-[10px]" onClick={() => regenerate.mutate()} disabled={regenerate.isPending}>
          {regenerate.isPending ? "Generating…" : "Regenerate Analysis"}
        </Button>
      </div>
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
