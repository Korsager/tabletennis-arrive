import { useState } from "react";
import { X } from "lucide-react";
import { MatchRow, useUpdateMatchScore } from "@/hooks/useData";
import { toast } from "sonner";

interface ReportScoreModalProps {
  match: MatchRow;
  onClose: () => void;
}

const ReportScoreModal = ({ match, onClose }: ReportScoreModalProps) => {
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [isForfeit, setIsForfeit] = useState(false);
  const [forfeitBy, setForfeitBy] = useState("");
  const mutation = useUpdateMatchScore();

  const handleSave = () => {
    const score1 = parseInt(s1);
    const score2 = parseInt(s2);
    if (isNaN(score1) || isNaN(score2)) {
      toast.error("Please enter valid scores");
      return;
    }
    mutation.mutate(
      {
        matchId: match.id,
        score1,
        score2,
        forfeitBy: isForfeit ? forfeitBy || null : null,
      },
      {
        onSuccess: () => {
          toast.success("Score reported!");
          onClose();
        },
        onError: (err) => toast.error("Failed to save: " + err.message),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-2xl border bg-card/95 p-6 shadow-2xl backdrop-blur-md">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
        <h2 className="mb-6 text-lg font-extrabold text-primary">Report Score</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 text-center">
            <p className="mb-2 text-sm font-bold">{match.player1?.display_name ?? "Player 1"}</p>
            <input
              value={s1}
              onChange={(e) => setS1(e.target.value)}
              type="number"
              min={0}
              className="w-full rounded-xl border bg-muted/30 py-3 text-center text-2xl font-extrabold focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
            />
          </div>
          <span className="text-sm font-bold text-muted-foreground">vs</span>
          <div className="flex-1 text-center">
            <p className="mb-2 text-sm font-bold">{match.player2?.display_name ?? "Player 2"}</p>
            <input
              value={s2}
              onChange={(e) => setS2(e.target.value)}
              type="number"
              min={0}
              className="w-full rounded-xl border bg-muted/30 py-3 text-center text-2xl font-extrabold focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
            />
          </div>
        </div>

        <label className="mt-5 flex items-center gap-2 text-sm font-medium text-foreground">
          <input type="checkbox" checked={isForfeit} onChange={(e) => setIsForfeit(e.target.checked)} className="h-4 w-4 rounded border-border accent-accent" />
          Mark as Forfeit
        </label>

        {isForfeit && (
          <select
            value={forfeitBy}
            onChange={(e) => setForfeitBy(e.target.value)}
            className="mt-2 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Who forfeited?</option>
            {match.player1_id && <option value={match.player1_id}>{match.player1?.display_name}</option>}
            {match.player2_id && <option value={match.player2_id}>{match.player2?.display_name}</option>}
          </select>
        )}

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-transform hover:scale-105 disabled:opacity-50"
          >
            {mutation.isPending ? "Saving..." : "Save Result"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportScoreModal;
