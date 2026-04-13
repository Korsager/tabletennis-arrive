import { useState } from "react";
import { ProfileRow } from "@/hooks/useData";

interface PowerRankingsProps {
  profiles: ProfileRow[];
  onPlayerClick: (player: ProfileRow) => void;
}

const PowerRankings = ({ profiles, onPlayerClick }: PowerRankingsProps) => {
  // Sort all registered players by ELO (highest first = seed 1)
  const sorted = [...profiles].sort((a, b) => (b.elo || 0) - (a.elo || 0));

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

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
        <p className="text-muted-foreground">No players registered for this tournament yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
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
                        <td className="px-4 py-3">{getSeedBadge(i + 1)}</td>
                        <td className="px-4 py-3 font-semibold">{player.display_name}</td>
                        <td className="px-4 py-3 text-right font-extrabold">{player.elo || 1200}</td>
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
