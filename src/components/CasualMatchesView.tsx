import { Calendar } from "lucide-react";
import { MatchRow, useCasualMatches } from "@/hooks/useData";

interface Props {
  userId: string;
  profileId: string;
  onReportScore: (m: MatchRow) => void;
  onCreateCasual: () => void;
}

const CasualMatchesView = ({ userId, profileId, onReportScore, onCreateCasual }: Props) => {
  const { data: matches = [] } = useCasualMatches(userId);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={onCreateCasual}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Challenge a Player
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">No casual matches yet. Challenge someone to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => {
            const isParticipant = match.player1_id === profileId || match.player2_id === profileId;
            const isPending = match.status === "Pending";
            return (
              <div key={match.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
                  <span className="text-xs font-bold text-muted-foreground">Casual</span>
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
                    <p className="flex-1 text-sm font-bold">{match.player1?.display_name ?? "TBD"}</p>
                    <div className="flex items-center gap-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/50 text-lg font-extrabold">
                        {match.score1 ?? "-"}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">vs</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/50 text-lg font-extrabold">
                        {match.score2 ?? "-"}
                      </span>
                    </div>
                    <p className="flex-1 text-right text-sm font-bold">{match.player2?.display_name ?? "TBD"}</p>
                  </div>
                  {match.scheduled_at && (
                    <div className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      <Calendar size={12} />
                      {new Date(match.scheduled_at).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}{" "}
                      {new Date(match.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                </div>
                {isParticipant && isPending && (
                  <button
                    onClick={() => onReportScore(match)}
                    className="border-t bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Report Score
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CasualMatchesView;
