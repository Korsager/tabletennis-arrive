import { playoffBracket } from "@/data/mockData";

const PlayoffsView = () => {
  const qf = playoffBracket.filter((m) => m.round === "QF");
  const sf = playoffBracket.filter((m) => m.round === "SF");
  const final = playoffBracket.filter((m) => m.round === "Final");

  const MatchNode = ({ match, isFinal }: { match: typeof playoffBracket[0]; isFinal?: boolean }) => (
    <div
      className={`w-56 rounded-2xl border bg-card p-3 shadow-sm ${
        isFinal ? "animate-glow-pulse ring-2 ring-accent" : ""
      }`}
    >
      <div className="space-y-2">
        <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${match.winner === match.player1 ? "bg-accent/10 font-bold" : "bg-muted/30"}`}>
          <span className="truncate text-sm">{match.player1 ?? "TBD"}</span>
          <span className="text-sm font-bold">{match.score1 ?? "-"}</span>
        </div>
        <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${match.winner === match.player2 ? "bg-accent/10 font-bold" : "bg-muted/30"}`}>
          <span className="truncate text-sm">{match.player2 ?? "TBD"}</span>
          <span className="text-sm font-bold">{match.score2 ?? "-"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-[750px] items-center justify-center gap-12 py-8">
        {/* Quarter-Finals */}
        <div className="space-y-6">
          <h3 className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">Quarter-Finals</h3>
          {qf.map((m) => (
            <MatchNode key={m.id} match={m} />
          ))}
        </div>

        {/* Connector lines */}
        <div className="flex flex-col items-center gap-24 text-muted-foreground">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 w-px bg-border" />
          ))}
        </div>

        {/* Semi-Finals */}
        <div className="space-y-12">
          <h3 className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">Semi-Finals</h3>
          {sf.map((m) => (
            <MatchNode key={m.id} match={m} />
          ))}
        </div>

        {/* Connector */}
        <div className="h-16 w-px bg-border" />

        {/* Final */}
        <div>
          <h3 className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-accent">Grand Final</h3>
          {final.map((m) => (
            <MatchNode key={m.id} match={m} isFinal />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayoffsView;
