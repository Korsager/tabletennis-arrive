import { useState } from "react";
import { useTournamentRules, useCreateTournament, TournamentRulesRow } from "@/hooks/useData";
import { toast } from "sonner";

interface Tournament {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  active: boolean;
}

interface RulesAdminProps {
  isAdmin: boolean;
  tournament?: Tournament;
}

const DEFAULT_RULE_TEXT = `Group stage seeding method: Bracket optimization. Seed numbers are distributed in groups by avoiding grouping those that should normally meet in the bracket (1 vs 8, 2 vs 7, 3 vs 6, 4 vs 5). This preserves classic bracket seeding and is optimal when directly following a single or double elimination structure.`;

const RulesAdmin = ({ isAdmin, tournament }: RulesAdminProps) => {
  const { data: rules } = useTournamentRules(tournament?.id);
  const createTournament = useCreateTournament();

  const [tournamentName, setTournamentName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rulesText, setRulesText] = useState(DEFAULT_RULE_TEXT);
  const [saved, setSaved] = useState(false);

  const handleCreateTournament = () => {
    if (!tournamentName.trim() || !startDate || !endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    createTournament.mutate(
      {
        name: tournamentName.trim(),
        startDate,
        endDate,
        description: rulesText,
      },
      {
        onSuccess: () => {
          toast.success("Tournament created successfully!");
          setTournamentName("");
          setStartDate("");
          setEndDate("");
          setRulesText(DEFAULT_RULE_TEXT);
        },
        onError: () => toast.error("Failed to create tournament"),
      }
    );
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold text-primary">Admin Panel</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">Tournament Name</label>
              <input
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="New Tournament Name"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
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
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">Tournament Rules / Seeding Method</label>
            <textarea
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              rows={4}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={handleCreateTournament}
            disabled={createTournament.isPending}
            className="mt-4 rounded-lg bg-accent px-5 py-2 text-sm font-bold text-accent-foreground transition-transform hover:scale-105 disabled:opacity-50"
          >
            Create New Tournament
          </button>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-extrabold text-primary">Tournament Info</h2>
        {tournament && (
          <div className="mb-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-muted px-3 py-1 font-semibold">{tournament.name}</span>
            <span className="text-muted-foreground">{tournament.start_date} → {tournament.end_date}</span>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">Best of 5</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-bold text-foreground">Format</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Group Stage: Best of {rules?.group_stage_games ?? 3} games</li>
              <li>Playoffs: Best of {rules?.playoff_games ?? 5} games</li>
              <li>Top 6 advance to playoffs (1-2 to semis, 3-6 to quarters)</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-bold text-foreground">Scoring</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Win: <span className="font-semibold text-foreground">{rules?.win_points ?? 3} points</span></li>
              <li>Draw: <span className="font-semibold text-foreground">{rules?.draw_points ?? 1} point</span></li>
              <li>Loss: <span className="font-semibold text-foreground">{rules?.loss_points ?? 0} points</span></li>
              <li>Forfeit: <span className="font-semibold text-red-500">{rules?.forfeit_points ?? -1} point</span> to forfeiting player</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-bold text-foreground">Tiebreakers</h3>
            <pre className="rounded-xl bg-muted/50 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
{`1. Points
2. Head-to-head
3. Game score difference (head-to-head)
4. Game score difference (overall)
5. Match score difference (head-to-head)
6. Match score difference (overall)
7. Match wins/draws/losses/forfeits (overall)`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesAdmin;
