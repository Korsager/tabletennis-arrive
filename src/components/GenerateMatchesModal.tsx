import { useMemo } from "react";
import { X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  useTournamentParticipants,
  useMatches,
  useGenerateGroupMatches,
  useDeleteAllGroupMatches,
} from "@/hooks/useData";

interface GenerateMatchesModalProps {
  tournament: { id: string; name: string; best_of: number };
  onClose: () => void;
}

const GenerateMatchesModal = ({ tournament, onClose }: GenerateMatchesModalProps) => {
  const { data: participants = [] } = useTournamentParticipants(tournament.id);
  const { data: matches = [] } = useMatches(tournament.id);
  const generate = useGenerateGroupMatches();
  const deleteAll = useDeleteAllGroupMatches();

  const groups = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of participants) {
      const key = p.group_name ?? "Ungrouped";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [participants]);

  const predictedCount = useMemo(() => {
    let total = 0;
    for (const [, count] of groups) total += (count * (count - 1)) / 2;
    return total;
  }, [groups]);

  const existingGroupMatches = matches.filter((m) => m.match_type === "group");
  const hasExisting = existingGroupMatches.length > 0;

  const handleGenerate = () => {
    generate.mutate(
      { tournament_id: tournament.id },
      {
        onSuccess: (res) => {
          toast.success(`Generated ${res.count} matches`);
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
        onSuccess: () => toast.success("Existing matches deleted"),
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
        <h2 className="mb-1 text-lg font-extrabold text-primary">Generate Group Stage Matches</h2>
        <p className="mb-4 text-xs text-muted-foreground">{tournament.name}</p>

        {participants.length === 0 ? (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            Add participants in the Rules tab before generating matches.
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-lg border bg-muted/20 p-4">
              <p className="text-sm font-bold">
                {participants.length} participants across {groups.length} group
                {groups.length === 1 ? "" : "s"}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {groups.map(([name, count]) => (
                  <li key={name}>
                    {name}: {count} player{count === 1 ? "" : "s"}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">
                This will create {predictedCount} match{predictedCount === 1 ? "" : "es"}
              </p>
              <p className="text-xs text-muted-foreground">
                Best of {tournament.best_of} per match.
              </p>
            </div>

            {hasExisting && (
              <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-800">
                      {existingGroupMatches.length} group matches already exist for this
                      tournament.
                    </p>
                    <p className="mt-1 text-xs text-amber-700">
                      Generating will require deleting them first.
                    </p>
                    <button
                      onClick={handleDelete}
                      disabled={deleteAll.isPending}
                      className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleteAll.isPending ? "Deleting..." : "Delete existing first"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
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
            disabled={
              generate.isPending ||
              participants.length === 0 ||
              hasExisting ||
              predictedCount === 0
            }
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-transform hover:scale-105 disabled:opacity-50"
          >
            {generate.isPending ? "Generating..." : "Generate Matches"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateMatchesModal;