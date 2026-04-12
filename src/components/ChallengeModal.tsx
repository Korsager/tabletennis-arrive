import { useState } from "react";
import { X } from "lucide-react";
import { ProfileRow, useCreateChallenge } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ChallengeModalProps {
  profiles: ProfileRow[];
  onClose: () => void;
}

const ChallengeModal = ({ profiles, onClose }: ChallengeModalProps) => {
  const { user } = useAuth();
  const [challengedId, setChallengedId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const createChallenge = useCreateChallenge();

  const availableOpponents = profiles.filter(p => p.user_id !== user?.id);

  const handleCreate = () => {
    if (!challengedId || !scheduledAt) {
      toast.error("Please select an opponent and schedule time");
      return;
    }

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      toast.error("Please select a future date and time");
      return;
    }

    createChallenge.mutate(
      {
        challengerId: user!.id,
        challengedId,
        scheduledAt: scheduledDate.toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Challenge sent!");
          onClose();
        },
        onError: () => toast.error("Failed to create challenge"),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-2xl border bg-card/95 p-6 shadow-2xl backdrop-blur-md">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
        <h2 className="mb-6 text-lg font-extrabold text-primary">Challenge a Player</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Select Opponent</label>
            <select
              value={challengedId}
              onChange={(e) => setChallengedId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Choose a player to challenge</option>
              {availableOpponents.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.display_name} (Elo: {profile.elo})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Schedule Match</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              The opponent will be able to accept, decline, or suggest a new time.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={createChallenge.isPending || !challengedId || !scheduledAt}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-transform hover:scale-105 disabled:opacity-50"
          >
            {createChallenge.isPending ? "Sending..." : "Send Challenge"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;