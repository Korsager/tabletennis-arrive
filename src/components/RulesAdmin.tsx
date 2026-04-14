import { useTournamentRules } from "@/hooks/useData";
import { DEFAULT_TOURNAMENT_RULES_DESCRIPTION } from "@/lib/tournamentDefaults";

interface Tournament {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  active: boolean;
  description?: string;
}

interface RulesAdminProps {
  isAdmin: boolean;
  tournament?: Tournament;
}

const RulesAdmin = ({ isAdmin, tournament }: RulesAdminProps) => {
  const { data: rules } = useTournamentRules(tournament?.id);
  const description = tournament?.description ?? DEFAULT_TOURNAMENT_RULES_DESCRIPTION;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-extrabold text-primary">Tournament Info</h2>
        {tournament && (
          <div className="mb-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-muted px-3 py-1 font-semibold">{tournament.name}</span>
            <span className="text-muted-foreground">{tournament.start_date} → {tournament.end_date}</span>
          </div>
        )}

        <div className="grid gap-6">
          <div>
            <h3 className="mb-2 font-bold text-foreground">Structure</h3>
            <div className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="mb-2">
                <strong>Groupstage</strong>
                <span className="block text-foreground">League format</span>
              </p>
              <p>
                <strong>Playoffs</strong>
                <span className="block text-foreground">Single elimination format</span>
              </p>
            </div>
          </div>

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

          <div>
            <h3 className="mb-2 font-bold text-foreground">Rule Description</h3>
            <pre className="whitespace-pre-wrap rounded-2xl bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
              {description}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesAdmin;
