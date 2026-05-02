import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  usePlayoffMatches,
  useTournamentStandingsPreview,
  useGeneratePlayoffBracket,
  useDeletePlayoffBracket,
} from "@/hooks/useData";

interface GeneratePlayoffsModalProps {
  tournament: { id: string; name: string; best_of: number; playoff_size: number | null };
  onClose: () => void;
}

const GeneratePlayoffsModal = ({ tournament, onClose }: GeneratePlayoffsModalProps) => {
  const defaultSize: 4 | 8 = tournament.playoff_size === 8 ? 8 : 4;
  const [size, setSize] = useState<4 | 8>(defaultSize);
  const { data: standings = [] } = useTournamentStandingsPreview(tournament.id);
  const { data: existing = [] } = usePlayoffMatches(tournament.id);
  const generate = useGeneratePlayoffBracket();
  const deleteAll = useDeletePlayoffBracket();

  useEffect(() => {
    setSize(tournament.playoff_size === 8 ? 8 : 4);
  }, [tournament.playoff_size]);

  const hasExisting = existing.length > 0;
  const enoughPlayers = standings.length >= size;
  const topN = standings.slice(0, Math.max(size, 8));

  const handleGenerate = () => {
    generate.mutate(
      { tournament_id: tournament.id, size },
      {
        onSuccess: (res) => {
          toast.success(`Generated bracket with ${res.count} matches`);
          onClose();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDelete = () => {
    deleteAll.mutate(
      { tournament_id: tournament.id },
      {
        onSuccess: () => toast.success("Existing bracket deleted"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border bg-card/95 p-6 shadow-2xl backdrop-blur-md max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>
        <h2 className="mb-1 text-lg font-extrabold text-primary">Generate Playoff Bracket</h2>
        <p className="mb-4 text-xs text-muted-foreground">{tournament.name}</p>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Bracket Size
          </label>
          <div className="flex gap-2">
            {[4, 8].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s as 4 | 8)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
                  size === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-muted/30 hover:bg-muted"
                }`}
              >
                {s} players
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 rounded-lg border bg-muted/20 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Current Standings ({standings.length} players ranked)
          </p>
          {topN.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No completed group matches yet — finish group play before seeding.
            </p>
          ) : (
            <ol className="space-y-1 text-xs">
              {topN.map((s, i) => (
                <li
                  key={s.profile_id}
                  className={`flex items-center justify-between rounded px-2 py-1 ${
                    i < size ? "bg-accent/10 font-semibold" : "text-muted-foreground"
                  }`}
                >
                  <span>
                    {i + 1}. {s.display_name}
                    {s.group_name && (
                      <span className="ml-1 text-muted-foreground">({s.group_name})</span>
                    )}
                  </span>
                  <span>
                    {s.points} pts • {s.gameDiff > 0 ? "+" : ""}
                    {s.gameDiff}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {!enoughPlayers && standings.length > 0 && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
            Need at least {size} ranked players. Only {standings.length} available.
          </div>
        )}

        {hasExisting && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">
                  A playoff bracket already exists ({existing.length} matches).
                </p>
                <button
                  onClick={handleDelete}
                  disabled={deleteAll.isPending}
                  className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteAll.isPending ? "Deleting..." : "Delete existing bracket"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generate.isPending || hasExisting || !enoughPlayers}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-transform hover:scale-105 disabled:opacity-50"
          >
            {generate.isPending ? "Generating..." : "Generate Bracket"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratePlayoffsModal;