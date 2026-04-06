import { useState } from "react";
import { tournaments, rules } from "@/data/mockData";

interface RulesAdminProps {
  isAdmin: boolean;
}

const RulesAdmin = ({ isAdmin }: RulesAdminProps) => {
  const current = tournaments.find((t) => t.active);
  const [tournamentName, setTournamentName] = useState(current?.name ?? "");
  const [startDate, setStartDate] = useState(current?.startDate ?? "");
  const [endDate, setEndDate] = useState(current?.endDate ?? "");
  const [editableRules, setEditableRules] = useState(rules);

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold text-primary">Admin Panel</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">Tournament Name</label>
              <input value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <button className="mt-4 rounded-lg bg-accent px-5 py-2 text-sm font-bold text-accent-foreground transition-transform hover:scale-105">
            Archive Current & Start New
          </button>
          <div className="mt-6">
            <label className="mb-1 block text-xs font-bold text-muted-foreground">Edit Ruleset</label>
            <textarea
              value={editableRules}
              onChange={(e) => setEditableRules(e.target.value)}
              rows={12}
              className="w-full rounded-lg border bg-muted/30 px-4 py-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-extrabold text-primary">Tournament Info</h2>
        {current && (
          <div className="mb-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-muted px-3 py-1 font-semibold">{current.name}</span>
            <span className="text-muted-foreground">{current.startDate} → {current.endDate}</span>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">Best of 5</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-bold text-foreground">Scoring</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Win: <span className="font-semibold text-foreground">3 points</span></li>
              <li>Draw: <span className="font-semibold text-foreground">1 point</span></li>
              <li>Loss: <span className="font-semibold text-foreground">0 points</span></li>
              <li>Forfeit: <span className="font-semibold text-red-500">-1 point</span> to forfeiting player</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-bold text-foreground">Tiebreakers</h3>
            <pre className="rounded-xl bg-muted/50 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
{`1. Head-to-head record
2. Game difference (GW - GL)
3. Points scored difference
4. Coin flip`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesAdmin;
