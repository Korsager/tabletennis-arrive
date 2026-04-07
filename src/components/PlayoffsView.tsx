import { PlayoffMatchRow } from "@/hooks/useData";

interface PlayoffsViewProps {
  playoffMatches: PlayoffMatchRow[];
}

const PlayoffsView = ({ playoffMatches }: PlayoffsViewProps) => {
  const qf = playoffMatches.filter((m) => m.round === "QF");
  const sf = playoffMatches.filter((m) => m.round === "SF");
  const final = playoffMatches.filter((m) => m.round === "Final");

  if (playoffMatches.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
        <p className="text-muted-foreground">Playoff bracket not yet created for this tournament.</p>
      </div>
    );
  }

  const MatchNode = ({ match, isFinal }: { match: PlayoffMatchRow; isFinal?: boolean }) => (
    <div
      className={`w-56 rounded-2xl border bg-card p-3 shadow-sm ${
        isFinal ? "animate-glow-pulse ring-2 ring-accent" : ""
      }`}
    >
      <div className="space-y-2">
        <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${match.winner_id === match.player1_id && match.winner_id ? "bg-accent/10 font-bold" : "bg-muted/30"}`}>
          <span className="truncate text-sm">{match.player1?.display_name ?? "TBD"}</span>
          <span className="text-sm font-bold">{match.score1 ?? "-"}</span>
        </div>
        <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${match.winner_id === match.player2_id && match.winner_id ? "bg-accent/10 font-bold" : "bg-muted/30"}`}>
          <span className="truncate text-sm">{match.player2?.display_name ?? "TBD"}</span>
          <span className="text-sm font-bold">{match.score2 ?? "-"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-[750px] items-center justify-center gap-12 py-8">
        {qf.length > 0 && (
          <div className="space-y-6">
            <h3 className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">Quarter-Finals</h3>
            {qf.map((m) => <MatchNode key={m.id} match={m} />)}
          </div>
        )}

        {qf.length > 0 && sf.length > 0 && (
          <div className="flex flex-col items-center gap-24 text-muted-foreground">
            {[0, 1].map((i) => <div key={i} className="h-16 w-px bg-border" />)}
          </div>
        )}

        {sf.length > 0 && (
          <div className="space-y-12">
            <h3 className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">Semi-Finals</h3>
            {sf.map((m) => <MatchNode key={m.id} match={m} />)}
          </div>
        )}

        {sf.length > 0 && final.length > 0 && <div className="h-16 w-px bg-border" />}

        {final.length > 0 && (
          <div>
            <h3 className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-accent">Grand Final</h3>
            {final.map((m) => <MatchNode key={m.id} match={m} isFinal />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayoffsView;
