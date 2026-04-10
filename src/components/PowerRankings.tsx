import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ProfileRow, useUpdateRankingVisibility } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PowerRankingsProps {
  profiles: ProfileRow[];
  onPlayerClick: (player: ProfileRow) => void;
}

const PowerRankings = ({ profiles, onPlayerClick }: PowerRankingsProps) => {
  const { user, profile: authProfile } = useAuth();

  // Find the current user's profile from the profiles list (has visible_in_ranking)
  const currentUserProfile = profiles.find((p) => p.user_id === user?.id);
  const isVisible = currentUserProfile?.visible_in_ranking ?? true;

  const updateVisibility = useUpdateRankingVisibility();

  // Only show players who are visible in ranking
  const visibleProfiles = profiles.filter((p) => p.visible_in_ranking);
  const sorted = [...visibleProfiles].sort((a, b) => b.elo - a.elo);

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

  const handleToggleVisibility = () => {
    if (!user) return;
    const newVisible = !isVisible;
    updateVisibility.mutate(
      { userId: user.id, visible: newVisible },
      {
        onSuccess: () =>
          toast.success(
            newVisible
              ? "You are now visible in the Power Rankings."
              : "You are now hidden from the Power Rankings."
          ),
        onError: () => toast.error("Failed to update ranking visibility."),
      }
    );
  };

  const getRankBadge = (rank: number) => {
    const colors = ["bg-yellow-400 text-yellow-900", "bg-gray-300 text-gray-800", "bg-amber-600 text-amber-100"];
    if (rank <= 3) {
      return (
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${colors[rank - 1]}`}>
          {rank}
        </span>
      );
    }
    return <span className="flex h-7 w-7 items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
  };

  const getWinProb = () => {
    if (!p1 || !p2 || p1 === p2) return null;
    const e1 = profiles.find((p) => p.id === p1)?.elo ?? 1200;
    const e2 = profiles.find((p) => p.id === p2)?.elo ?? 1200;
    const prob = 1 / (1 + Math.pow(10, (e2 - e1) / 400));
    return Math.round(prob * 100);
  };

  const prob = getWinProb();
  const player1Name = profiles.find((p) => p.id === p1)?.display_name;
  const player2Name = profiles.find((p) => p.id === p2)?.display_name;

  if (profiles.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
        <p className="text-muted-foreground">No players registered yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visibility toggle for logged-in users */}
      {user && currentUserProfile && (
        <div className="flex items-center justify-between rounded-2xl border bg-card px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            {isVisible ? (
              <Eye size={20} className="text-accent" />
            ) : (
              <EyeOff size={20} className="text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-semibold">
                {isVisible ? "Visible in Power Rankings" : "Hidden from Power Rankings"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isVisible
                  ? "Your Elo rank is publicly displayed. Toggle to hide yourself."
                  : "You won't appear in the rankings. Your Elo is still tracked."}
              </p>
            </div>
          </div>
          {/* Toggle switch */}
          <button
            onClick={handleToggleVisibility}
            disabled={updateVisibility.isPending}
            aria-label={isVisible ? "Hide from rankings" : "Show in rankings"}
            className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 ${
              isVisible ? "bg-accent" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
                isVisible ? "translate-x-7" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="border-b bg-muted/30 px-4 py-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
                All-Time Power Rankings
              </h2>
            </div>
            {sorted.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No players are currently visible in the rankings.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-bold text-muted-foreground">Rank</th>
                      <th className="px-4 py-3 text-left font-bold text-muted-foreground">Player</th>
                      <th className="px-4 py-3 text-right font-bold text-muted-foreground">Elo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((player, i) => (
                      <tr
                        key={player.id}
                        onClick={() => onPlayerClick(player)}
                        className="cursor-pointer border-b transition-colors last:border-0 hover:bg-accent/5"
                      >
                        <td className="px-4 py-3">{getRankBadge(i + 1)}</td>
                        <td className="px-4 py-3 font-semibold">{player.display_name}</td>
                        <td className="px-4 py-3 text-right font-extrabold">{player.elo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Matchup Predictor</h3>
            <div className="space-y-3">
              <select value={p1} onChange={(e) => setP1(e.target.value)} className="w-full rounded-lg border bg-card px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select Player 1</option>
                {profiles.map((p) => <option key={p.id} value={p.id}>{p.display_name}</option>)}
              </select>
              <select value={p2} onChange={(e) => setP2(e.target.value)} className="w-full rounded-lg border bg-card px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select Player 2</option>
                {profiles.map((p) => <option key={p.id} value={p.id}>{p.display_name}</option>)}
              </select>
            </div>
            {prob !== null && (
              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-primary">{player1Name}</span>
                  <span className="text-accent">{player2Name}</span>
                </div>
                <div className="relative h-5 overflow-hidden rounded-full bg-muted">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all" style={{ width: `${prob}%` }} />
                  <div className="absolute inset-y-0 right-0 rounded-full bg-accent transition-all" style={{ width: `${100 - prob}%` }} />
                </div>
                <div className="flex justify-between text-xs font-extrabold">
                  <span>{prob}%</span>
                  <span>{100 - prob}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerRankings;
