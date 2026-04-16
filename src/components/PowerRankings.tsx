import { ProfileRow } from "@/hooks/useData";

interface PowerRankingsProps {
  profiles: ProfileRow[];
  onPlayerClick: (player: ProfileRow) => void;
}

const PowerRankings = ({ profiles, onPlayerClick }: PowerRankingsProps) => {
  // Sort all registered players by ELO (highest first = seed 1)
  const sorted = [...profiles].sort((a, b) => (b.elo || 0) - (a.elo || 0));

  const getSeedBadge = (seed: number) => {
    const colors = ["bg-yellow-400 text-yellow-900", "bg-gray-300 text-gray-800", "bg-amber-600 text-amber-100"];
    if (seed <= 3) {
      return (
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${colors[seed - 1]}`}>
          {seed}
        </span>
      );
    }
    return <span className="flex h-7 w-7 items-center justify-center text-sm font-bold text-muted-foreground">{seed}</span>;
  };

  if (profiles.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
        <p className="text-muted-foreground">No players registered for this tournament yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="border-b bg-muted/30 px-4 py-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
            Tournament Seeding
          </h2>
        </div>
        {sorted.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No registered players to display.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground">Seed</th>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground">Player</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((player, i) => (
                  <tr
                    key={player.id}
                    onClick={() => onPlayerClick(player)}
                    className="cursor-pointer border-b transition-colors last:border-0 hover:bg-accent/5"
                  >
                    <td className="px-4 py-3">{getSeedBadge(i + 1)}</td>
                    <td className="px-4 py-3 font-semibold">{player.display_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PowerRankings;
