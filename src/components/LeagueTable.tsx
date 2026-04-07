import { useState } from "react";
import { UserPlus } from "lucide-react";
import { computeStandings, MatchRow, ProfileRow } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { useRegisterPlayer } from "@/hooks/useData";
import { toast } from "sonner";

interface LeagueTableProps {
  matches: MatchRow[];
  profiles: ProfileRow[];
  isLoggedIn: boolean;
  userId?: string;
}

const LeagueTable = ({ matches, profiles, isLoggedIn, userId }: LeagueTableProps) => {
  const { profile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const registerMutation = useRegisterPlayer();

  const standings = computeStandings(matches, profiles);

  const handleRegister = () => {
    if (!userId || !displayName.trim()) return;
    registerMutation.mutate(
      { userId, displayName: displayName.trim() },
      {
        onSuccess: () => toast.success("Display name updated!"),
        onError: () => toast.error("Failed to update display name"),
      }
    );
  };

  const getBadge = (rank: number) => {
    if (rank <= 2) return <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">SF</span>;
    if (rank <= 6) return <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">QF</span>;
    return null;
  };

  const showRegister = isLoggedIn && profile;

  return (
    <div className="space-y-6">
      {showRegister && (
        <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-extrabold">
                <UserPlus size={22} /> Update Your Display Name
              </h2>
              <p className="mt-1 text-sm text-arrive-light-pink">Currently: {profile.display_name}</p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="New Display Name"
                className="rounded-lg bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={handleRegister}
                disabled={registerMutation.isPending}
                className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-accent-foreground transition-transform hover:scale-105 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {standings.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">No matches completed yet. Standings will appear here once games are played.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground">Player</th>
                  <th className="px-4 py-3 text-center font-bold text-muted-foreground">P</th>
                  <th className="px-4 py-3 text-center font-bold text-muted-foreground">W</th>
                  <th className="px-4 py-3 text-center font-bold text-muted-foreground">D</th>
                  <th className="px-4 py-3 text-center font-bold text-muted-foreground">L</th>
                  <th className="px-4 py-3 text-center font-bold text-muted-foreground">F</th>
                  <th className="px-4 py-3 text-center font-bold text-muted-foreground">Games</th>
                  <th className="px-4 py-3 text-center font-bold text-muted-foreground">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr key={s.profileId} className="border-b transition-colors last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-bold">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{s.name}</span>
                        {getBadge(i + 1)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{s.played}</td>
                    <td className="px-4 py-3 text-center font-semibold text-green-600">{s.wins}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{s.draws}</td>
                    <td className="px-4 py-3 text-center text-red-500">{s.losses}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{s.forfeits}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{s.gamesWon}-{s.gamesLost}</td>
                    <td className="px-4 py-3 text-center text-lg font-extrabold">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueTable;
