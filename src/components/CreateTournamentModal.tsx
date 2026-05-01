import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useCreateTournament } from "@/hooks/useData";
import { DEFAULT_TOURNAMENT_RULES_DESCRIPTION } from "@/lib/tournamentDefaults";

interface CreateTournamentModalProps {
  archiveCurrentId?: string;
  onClose: () => void;
}

const CreateTournamentModal = ({ archiveCurrentId, onClose }: CreateTournamentModalProps) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bestOf, setBestOf] = useState("5");
  const [groupCount, setGroupCount] = useState("");
  const [playoffSize, setPlayoffSize] = useState("");
  const [rules, setRules] = useState(DEFAULT_TOURNAMENT_RULES_DESCRIPTION);

  const mutation = useCreateTournament();

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a tournament name.");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please pick start and end dates.");
      return;
    }
    if (endDate < startDate) {
      toast.error("End date must be on or after start date.");
      return;
    }
    const bestOfNum = parseInt(bestOf, 10);
    if (isNaN(bestOfNum) || bestOfNum < 1 || bestOfNum > 5) {
      toast.error("Best of must be between 1 and 5.");
      return;
    }

    mutation.mutate(
      {
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        best_of: bestOfNum,
        group_count: groupCount.trim() === "" ? null : parseInt(groupCount, 10),
        playoff_size: playoffSize === "" ? null : parseInt(playoffSize, 10),
        rules,
        archiveCurrentId,
      },
      {
        onSuccess: () => {
          toast.success("Tournament created");
          onClose();
        },
        onError: (err: Error) => toast.error(err.message || "Failed to create tournament"),
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
        className="relative w-full max-w-2xl rounded-2xl border bg-card/95 p-6 shadow-2xl backdrop-blur-md max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>
        <h2 className="mb-1 text-lg font-extrabold text-primary">Create Tournament</h2>
        {archiveCurrentId && (
          <p className="mb-4 text-xs text-muted-foreground">
            The current active tournament will be archived.
          </p>
        )}

        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">Tournament Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Spring 2026 League"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">Best Of</label>
              <input
                type="number"
                min={1}
                max={5}
                value={bestOf}
                onChange={(e) => setBestOf(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">Group Count</label>
              <input
                type="number"
                min={1}
                value={groupCount}
                onChange={(e) => setGroupCount(e.target.value)}
                placeholder="optional"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">Playoff Size</label>
              <select
                value={playoffSize}
                onChange={(e) => setPlayoffSize(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">—</option>
                <option value="4">4</option>
                <option value="8">8</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">Rules</label>
            <textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={10}
              className="w-full rounded-lg border px-3 py-2 text-sm font-mono leading-6 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={mutation.isPending}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-transform hover:scale-105 disabled:opacity-50"
          >
            {mutation.isPending ? "Creating..." : "Create Tournament"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTournamentModal;