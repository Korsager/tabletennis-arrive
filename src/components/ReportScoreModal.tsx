import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { MatchRow, useReportMatchScore, useMatchGames } from "@/hooks/useData";
import { toast } from "sonner";

interface ReportScoreModalProps {
  match: MatchRow;
  onClose: () => void;
}

const ReportScoreModal = ({ match, onClose }: ReportScoreModalProps) => {
  const bestOf = match.best_of ?? 5;
  const gamesNeededToWin = Math.ceil(bestOf / 2);

  const [games, setGames] = useState<Array<{ p1: string; p2: string }>>(
    Array.from({ length: bestOf }, () => ({ p1: "", p2: "" }))
  );
  const [isForfeit, setIsForfeit] = useState(!!match.forfeit_by);
  const [forfeitBy, setForfeitBy] = useState<string>(match.forfeit_by ?? "");
  const mutation = useReportMatchScore();
  const { data: existingGames } = useMatchGames(match.id);

  // Pre-fill from existing match_games
  useEffect(() => {
    if (!existingGames || existingGames.length === 0) return;
    setGames((prev) => {
      const next = prev.map((g) => ({ ...g }));
      for (const g of existingGames as Array<{
        game_number: number;
        p1_score: number;
        p2_score: number;
      }>) {
        const idx = g.game_number - 1;
        if (idx >= 0 && idx < next.length) {
          next[idx] = { p1: String(g.p1_score), p2: String(g.p2_score) };
        }
      }
      return next;
    });
  }, [existingGames]);

  const calculateMatchScore = () => {
    let p1Wins = 0;
    let p2Wins = 0;
    for (const g of games) {
      const a = parseInt(g.p1);
      const b = parseInt(g.p2);
      if (isNaN(a) || isNaN(b)) continue;
      if (a > b) p1Wins++;
      else if (b > a) p2Wins++;
    }
    return { p1Wins, p2Wins };
  };

  const updateGame = (idx: number, field: "p1" | "p2", value: string) => {
    setGames((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSave = () => {
    // Collect entered games
    const entered: Array<{ game_number: number; p1_score: number; p2_score: number }> = [];
    for (let i = 0; i < games.length; i++) {
      const g = games[i];
      const p1Empty = g.p1.trim() === "";
      const p2Empty = g.p2.trim() === "";
      if (p1Empty && p2Empty) continue;
      if (p1Empty || p2Empty) {
        toast.error(`Game ${i + 1}: enter both scores or leave both empty`);
        return;
      }
      const a = parseInt(g.p1);
      const b = parseInt(g.p2);
      if (isNaN(a) || isNaN(b) || a < 0 || b < 0) {
        toast.error(`Game ${i + 1}: invalid score`);
        return;
      }
      if (a === b && !isForfeit) {
        toast.error(`Game ${i + 1}: ties are not allowed`);
        return;
      }
      entered.push({ game_number: i + 1, p1_score: a, p2_score: b });
    }

    if (entered.length === 0) {
      toast.error("Enter at least one game");
      return;
    }

    // Ensure contiguous
    for (let i = 0; i < entered.length; i++) {
      if (entered[i].game_number !== i + 1) {
        toast.error("Games must be entered in order with no gaps");
        return;
      }
    }

    if (isForfeit && !forfeitBy) {
      toast.error("Select who forfeited");
      return;
    }

    const { p1Wins, p2Wins } = calculateMatchScore();
    if (!isForfeit && p1Wins < gamesNeededToWin && p2Wins < gamesNeededToWin) {
      toast.warning("No player has reached the required wins yet — saving anyway.");
    }

    mutation.mutate(
      {
        matchId: match.id,
        games: entered,
        forfeitBy: isForfeit ? forfeitBy || null : null,
        tournamentId: match.tournament_id,
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

  const totals = calculateMatchScore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl rounded-2xl border bg-card/95 p-6 shadow-2xl backdrop-blur-md max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
        <h2 className="mb-2 text-lg font-extrabold text-primary">Report Score</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Best of {bestOf} (First to {gamesNeededToWin} wins). Leave unplayed games blank.
        </p>

        <div className="space-y-3 mb-6">
          {games.map((g, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
              <span className="text-xs font-semibold text-muted-foreground w-14">Game {idx + 1}:</span>
              <div className="flex-1 flex items-center gap-2">
                <input
                  value={g.p1}
                  onChange={(e) => updateGame(idx, "p1", e.target.value)}
                  type="number"
                  min={0}
                  className="w-16 rounded-lg border bg-muted/30 py-2 px-2 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder=""
                />
                <span className="text-xs font-semibold text-muted-foreground">-</span>
                <input
                  value={g.p2}
                  onChange={(e) => updateGame(idx, "p2", e.target.value)}
                  type="number"
                  min={0}
                  className="w-16 rounded-lg border bg-muted/30 py-2 px-2 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder=""
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Match Score (auto-calculated)</p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{match.player1?.display_name ?? "Player 1"}</p>
              <p className="text-2xl font-extrabold">{totals.p1Wins}</p>
            </div>
            <span className="text-muted-foreground">vs</span>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{match.player2?.display_name ?? "Player 2"}</p>
              <p className="text-2xl font-extrabold">{totals.p2Wins}</p>
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
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
