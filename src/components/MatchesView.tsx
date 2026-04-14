import { MatchRow, ChallengeMatchRow } from "@/hooks/useData";

interface MatchesViewProps {
  matches: MatchRow[];
  challengeMatches?: ChallengeMatchRow[];
  onReportScore: (match: MatchRow) => void;
  isAdmin?: boolean;
}

const MatchesView = ({ matches, challengeMatches = [], onReportScore, isAdmin = false }: MatchesViewProps) => {
  const allMatches = [
    ...matches.map(m => ({ ...m, type: 'tournament' as const })),
    ...challengeMatches.map(m => ({ ...m, type: 'challenge' as const })),
  ].sort((a, b) => {
    // Sort by scheduled time if available, otherwise by created time
    const aTime = a.scheduled_at || a.created_at;
    const bTime = b.scheduled_at || b.created_at;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  if (allMatches.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
        <p className="text-muted-foreground">No matches scheduled yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {allMatches.map((match) => (
        <div key={match.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg">
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
            <span className="text-xs font-bold text-muted-foreground">
              {match.type === 'tournament' ? `Round ${match.round}` : 'Challenge Match'}
            </span>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                match.status === "Completed" || match.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : match.status === "accepted"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {match.status}
              </span>
            </div>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-bold">
                  {match.type === 'tournament'
                    ? (match.player1?.display_name ?? "TBD")
                    : (match.challenger?.display_name ?? "Unknown")
                  }
                </p>
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
                <p className="text-sm font-bold">
                  {match.type === 'tournament'
                    ? (match.player2?.display_name ?? "TBD")
                    : (match.challenged?.display_name ?? "Unknown")
                  }
                </p>
              </div>
            </div>
            {match.scheduled_at && (
              <div className="mt-2 text-xs text-muted-foreground">
                {new Date(match.scheduled_at).toLocaleDateString()} at{' '}
                {new Date(match.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
          {match.type === 'tournament' && (isAdmin || match.status === "Pending") && (
            <button
              onClick={() => onReportScore(match)}
              className="border-t bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {match.status === "Pending" ? "Report Score" : "Edit Result"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default MatchesView;
