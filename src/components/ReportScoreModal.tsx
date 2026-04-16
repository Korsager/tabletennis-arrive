import { useState } from "react";
import { X } from "lucide-react";
import { MatchRow, useUpdateMatchScore } from "@/hooks/useData";
import { toast } from "sonner";

interface ReportScoreModalProps {
  match: MatchRow;
  onClose: () => void;
}

const ReportScoreModal = ({ match, onClose }: ReportScoreModalProps) => {
  // Determine if this is a playoff match (string round) or group stage (numeric round)
  const isPlayoff = typeof match.round === 'string';
  const numGames = isPlayoff ? 5 : 3;
  const gamesNeededToWin = isPlayoff ? 3 : 2;

  // Initialize game scores state
  const [gameScores, setGameScores] = useState<Array<{ p1: string; p2: string }>>(
    Array(numGames).fill(null).map((_, i) => {
      // Try to load existing scores if match already has results
      return { p1: "", p2: "" };
    })
  );

  const [isForfeit, setIsForfeit] = useState(false);
  const [forfeitBy, setForfeitBy] = useState("");
  const mutation = useUpdateMatchScore();

  // Calculate match score based on game wins
  const calculateMatchScore = () => {
    let player1Wins = 0;
    let player2Wins = 0;

    for (const game of gameScores) {
      const p1Score = parseInt(game.p1);
      const p2Score = parseInt(game.p2);
      
      if (isNaN(p1Score) || isNaN(p2Score)) continue;
      
      if (p1Score > p2Score) {
        player1Wins++;
      } else if (p2Score > p1Score) {
        player2Wins++;
      }
    }

    return { player1Wins, player2Wins };
  };

  const handleGameScoreChange = (gameIndex: number, player: 'p1' | 'p2', value: string) => {
    const newScores = [...gameScores];
    newScores[gameIndex] = { ...newScores[gameIndex], [player]: value };
    setGameScores(newScores);
  };

  const handleSave = () => {
    // Validate all game scores are entered
    let allGamesEntered = true;
    for (const game of gameScores) {
      if (game.p1.trim() === "" || game.p2.trim() === "") {
        allGamesEntered = false;
        break;
      }
    }

    if (!allGamesEntered) {
      toast.error("Please enter all game scores");
      return;
    }

    // Validate scores are valid
    for (const game of gameScores) {
      if (isNaN(parseInt(game.p1)) || isNaN(parseInt(game.p2))) {
        toast.error("Please enter valid scores");
        return;
      }
    }

    const { player1Wins, player2Wins } = calculateMatchScore();

    mutation.mutate(
      {
        matchId: match.id,
        score1: player1Wins,
        score2: player2Wins,
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
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl rounded-2xl border bg-card/95 p-6 shadow-2xl backdrop-blur-md max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
        <h2 className="mb-2 text-lg font-extrabold text-primary">Report Score</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          {isPlayoff ? "Best of 5 (First to 3 wins)" : "Best of 3 (First to 2 wins)"}
        </p>

        <div className="space-y-3 mb-6">
          {Array.from({ length: numGames }).map((_, gameIndex) => (
            <div key={gameIndex} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
              <span className="text-xs font-semibold text-muted-foreground w-12">Game {gameIndex + 1}:</span>
              <div className="flex-1 flex items-center gap-2">
                <input
                  value={gameScores[gameIndex]?.p1 || ""}
                  onChange={(e) => handleGameScoreChange(gameIndex, 'p1', e.target.value)}
                  type="number"
                  min={0}
                  className="w-16 rounded-lg border bg-muted/30 py-2 px-2 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
                <span className="text-xs font-semibold text-muted-foreground">to</span>
                <input
                  value={gameScores[gameIndex]?.p2 || ""}
                  onChange={(e) => handleGameScoreChange(gameIndex, 'p2', e.target.value)}
                  type="number"
                  min={0}
                  className="w-16 rounded-lg border bg-muted/30 py-2 px-2 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
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
              <p className="text-2xl font-extrabold">{calculateMatchScore().player1Wins}</p>
            </div>
            <span className="text-muted-foreground">vs</span>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{match.player2?.display_name ?? "Player 2"}</p>
              <p className="text-2xl font-extrabold">{calculateMatchScore().player2Wins}</p>
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
