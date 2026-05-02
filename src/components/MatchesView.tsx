import { useState } from "react";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { MatchRow, ChallengeMatchRow, ProfileRow, useUpdateMatchSchedule } from "@/hooks/useData";

interface MatchesViewProps {
  matches: MatchRow[];
  challengeMatches?: ChallengeMatchRow[];
  onReportScore: (match: MatchRow) => void;
  isAdmin?: boolean;
  currentUser?: ProfileRow | null;
  disputedMatchIds?: string[];
  pendingApprovalMatchIds?: string[];
  onGenerateMatches?: () => void;
}

const MatchesView = ({ matches, challengeMatches = [], onReportScore, isAdmin = false, currentUser, disputedMatchIds = [], pendingApprovalMatchIds = [], onGenerateMatches }: MatchesViewProps) => {
  const [scheduleEditingId, setScheduleEditingId] = useState<string | null>(null);
  const updateSchedule = useUpdateMatchSchedule();
  const allMatches = [
    ...matches.map(m => ({ ...m, type: 'tournament' as const })),
    ...challengeMatches.map(m => ({ ...m, type: 'challenge' as const })),
  ].sort((a, b) => {
    // Admin-specific sorting: disputed first, then pending approval
    if (isAdmin) {
      const aIsDisputed = disputedMatchIds.includes(a.id);
      const bIsDisputed = disputedMatchIds.includes(b.id);
      
      if (aIsDisputed && !bIsDisputed) return -1;
      if (!aIsDisputed && bIsDisputed) return 1;
      
      const aIsPendingApproval = pendingApprovalMatchIds.includes(a.id);
      const bIsPendingApproval = pendingApprovalMatchIds.includes(b.id);
      
      if (aIsPendingApproval && !bIsPendingApproval) return -1;
      if (!aIsPendingApproval && bIsPendingApproval) return 1;
    }
    
    // Status priority: Accepted (1) < Pending (2) < Completed (3)
    const statusPriority: Record<string, number> = {
      'accepted': 1,
      'Accepted': 1,
      'pending': 2,
      'Pending': 2,
      'completed': 3,
      'Completed': 3,
    };
    
    const statusA = statusPriority[a.status] || 2;
    const statusB = statusPriority[b.status] || 2;
    
    if (statusA !== statusB) {
      return statusA - statusB;
    }
    
    // If statuses are equal, sort by round
    const getRoundNumber = (match: any) => {
      if (match.type === 'challenge') return -1; // Challenge matches first (before Round 1)
      // Handle both string rounds (playoff: "QF", "SF", "Final") and numeric rounds (group stage: 1, 2, 3)
      if (typeof match.round === 'string') {
        // For playoff matches, assign numeric values
        if (match.round === 'QF') return 100;
        if (match.round === 'SF') return 101;
        if (match.round === 'Final') return 102;
        // Try to parse as number if it contains digits
        const parsed = parseInt(match.round);
        return isNaN(parsed) ? 0 : parsed;
      }
      // For numeric rounds (group stage)
      return match.round || 0;
    };
    
    const roundA = getRoundNumber(a);
    const roundB = getRoundNumber(b);
    
    return roundA - roundB;
  });

  const header = isAdmin && onGenerateMatches ? (
    <div className="mb-4 flex justify-end">
      <button
        onClick={onGenerateMatches}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Generate Matches
      </button>
    </div>
  ) : null;

  if (allMatches.length === 0) {
    return (
      <div>
        {header}
        <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">No matches scheduled yet.</p>
        </div>
      </div>
    );
  }

  const handleScheduleChange = (match: MatchRow, value: string) => {
    const iso = value ? new Date(value).toISOString() : null;
    updateSchedule.mutate(
      { matchId: match.id, scheduled_at: iso, tournamentId: match.tournament_id },
      {
        onSuccess: () => {
          toast.success(iso ? "Match scheduled" : "Schedule cleared");
          setScheduleEditingId(null);
        },
        onError: (err) => toast.error("Failed to schedule: " + err.message),
      }
    );
  };

  return (
    <div>
      {header}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {allMatches.map((match) => (
        <div key={match.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg">
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">
                {match.type === 'tournament' ? `Round ${match.round}` : 'Challenge Match'}
              </span>
              {isAdmin && disputedMatchIds.includes(match.id) && (
                <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-red-100 text-red-700">
                  DISPUTED
                </span>
              )}
              {isAdmin && pendingApprovalMatchIds.includes(match.id) && (
                <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-orange-100 text-orange-700">
                  PENDING APPROVAL
                </span>
              )}
            </div>
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
              <div className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                <Calendar size={12} />
                {new Date(match.scheduled_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                {new Date(match.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            {isAdmin && match.type === 'tournament' && (
              <div className="mt-2">
                {scheduleEditingId === match.id ? (
                  <input
                    type="datetime-local"
                    autoFocus
                    defaultValue={match.scheduled_at ? new Date(match.scheduled_at).toISOString().slice(0, 16) : ''}
                    onBlur={(e) => handleScheduleChange(match as MatchRow, e.target.value)}
                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                  />
                ) : (
                  <button
                    onClick={() => setScheduleEditingId(match.id)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    📅 {match.scheduled_at ? 'Reschedule' : 'Schedule'}
                  </button>
                )}
              </div>
            )}
          </div>
          {match.type === 'tournament' && (isAdmin || (currentUser && (match.player1_id === currentUser.id || match.player2_id === currentUser.id))) && (
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
    </div>
  );
};

export default MatchesView;
