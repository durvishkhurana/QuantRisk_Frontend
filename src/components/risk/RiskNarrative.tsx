import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api";

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
    <div className="card narrative-card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3>
          <span className="sparkle">✦</span> AI Risk Summary
        </h3>
        <button type="button" className="btn" onClick={() => regenerate.mutate()} disabled={regenerate.isPending}>
          Regenerate
        </button>
      </div>
      {narrative ? (
        <p className="narrative-text">{narrative}</p>
      ) : (
        <div className="skeleton-lines">
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      )}
    </div>
  );
};
