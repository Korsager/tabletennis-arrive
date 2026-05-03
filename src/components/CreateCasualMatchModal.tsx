import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useProfiles, useCreateCasualMatch } from "@/hooks/useData";

interface Props {
  currentProfileId: string;
  onClose: () => void;
}

const CreateCasualMatchModal = ({ currentProfileId, onClose }: Props) => {
  const { data: profiles = [] } = useProfiles();
  const create = useCreateCasualMatch();
  const [opponentId, setOpponentId] = useState("");
  const [bestOf, setBestOf] = useState(5);
  const [scheduledAt, setScheduledAt] = useState("");

  const opponents = profiles.filter((p) => p.id !== currentProfileId);

  const submit = () => {
    if (!opponentId) {
      toast.error("Pick an opponent");
      return;
    }
    create.mutate(
      {
        player1_profile_id: currentProfileId,
        player2_profile_id: opponentId,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        best_of: bestOf,
      },
      {
        onSuccess: () => {
          toast.success("Casual match created");
          onClose();
        },
        onError: (e) => toast.error(e.message),
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
        className="relative w-full max-w-md rounded-2xl border bg-card/95 p-6 shadow-2xl backdrop-blur-md"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
        <h2 className="mb-4 text-lg font-extrabold text-primary">Challenge a Player</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Opponent
            </label>
            <select
              value={opponentId}
              onChange={(e) => setOpponentId(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              {opponents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Best Of
            </label>
            <select
              value={bestOf}
              onChange={(e) => setBestOf(Number(e.target.value))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              {[1, 3, 5].map((n) => (
                <option key={n} value={n}>
                  Best of {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Scheduled (optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={create.isPending}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-transform hover:scale-105 disabled:opacity-50"
          >
            {create.isPending ? "Creating…" : "Create Match"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCasualMatchModal;
