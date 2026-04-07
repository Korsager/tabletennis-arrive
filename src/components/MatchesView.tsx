import { MatchRow } from "@/hooks/useData";

interface MatchesViewProps {
  matches: MatchRow[];
  onReportScore: (match: MatchRow) => void;
}

const MatchesView = ({ matches, onReportScore }: MatchesViewProps) => {
  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
        <p className="text-muted-foreground">No matches scheduled yet for this tournament.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <div key={match.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg">
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
            <span className="text-xs font-bold text-muted-foreground">Round {match.round}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                match.status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {match.status}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-bold">{match.player1?.display_name ?? "TBD"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/50 text-lg font-extrabold">
                  {match.score1 ?? "-"}
                </span>
                <span className="text-xs font-bold text-muted-foreground">vs</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/50 text-lg font-extrabold">
                  {match.score2 ?? "-"}
                </span>
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-bold">{match.player2?.display_name ?? "TBD"}</p>
              </div>
            </div>
          </div>
          {match.status === "Pending" && (
            <button
              onClick={() => onReportScore(match)}
              className="border-t bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Report Score
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default MatchesView;
