import { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TabMenu, { TabId } from "@/components/TabMenu";
import LeagueTable from "@/components/LeagueTable";
import MatchesView from "@/components/MatchesView";
import PlayoffsView from "@/components/PlayoffsView";
import PowerRankings from "@/components/PowerRankings";
import RulesAdmin from "@/components/RulesAdmin";
import ReportScoreModal from "@/components/ReportScoreModal";
import PlayerHistoryModal from "@/components/PlayerHistoryModal";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments, useMatches, useProfiles, usePlayoffMatches, MatchRow, ProfileRow, useTournamentRules, useChallengeMatches, useTournamentParticipants, useTournamentMatchApprovals, useApproveMatchResult } from "@/hooks/useData";

const Tournament = () => {
  const { id: tournamentIdParam } = useParams<{ id?: string }>();
  const [activeTab, setActiveTab] = useState<TabId>("league");
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();
  const { data: tournaments = [] } = useTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

  // Auto-select tournament: use URL param if provided, then selected, then active, then first one
  const activeTournament = tournaments.find((t) => t.active);
  const currentTournamentId = tournamentIdParam || selectedTournamentId || activeTournament?.id || tournaments[0]?.id || null;

  const { data: matches = [] } = useMatches(currentTournamentId);
  const { data: profiles = [] } = useProfiles();
  const { data: playoffMatches = [] } = usePlayoffMatches(currentTournamentId);
  const { data: rules } = useTournamentRules(currentTournamentId);
  const { data: challengeMatches = [] } = useChallengeMatches();
  const { data: tournamentParticipants = [] } = useTournamentParticipants(currentTournamentId);
  const { data: pendingApprovals = [] } = useTournamentMatchApprovals(currentTournamentId);
  const approveMatchResult = useApproveMatchResult();

  const disputedApprovals = pendingApprovals.filter((approval) => !approval.approved);
  const matchesPendingApproval = matches.filter(
    (match) =>
      match.status === "Completed" &&
      !pendingApprovals.some((approval) => approval.match_id === match.id && approval.approved)
  );

  const [reportMatch, setReportMatch] = useState<MatchRow | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<ProfileRow | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAdmin={isAdmin}
        isLoggedIn={!!user}
        onSignOut={signOut}
        userName={profile?.display_name}
      />
      <TabMenu activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {activeTab === "league" && (
          <LeagueTable
            matches={matches}
            profiles={profiles}
            rules={rules}
            isLoggedIn={!!user}
            userId={user?.id}
          />
        )}
        {activeTab === "matches" && (
          <MatchesView 
            matches={matches} 
            challengeMatches={challengeMatches} 
            onReportScore={setReportMatch} 
            isAdmin={isAdmin} 
            currentUser={profile}
            disputedMatchIds={disputedApprovals.map(a => a.match_id)}
            pendingApprovalMatchIds={matchesPendingApproval.map(m => m.id)}
          />
        )}
        {activeTab === "playoffs" && (
          <PlayoffsView playoffMatches={playoffMatches} />
        )}
        {activeTab === "rankings" && (
          <PowerRankings profiles={tournamentParticipants.map(tp => tp.profile).filter(Boolean)} onPlayerClick={setSelectedPlayer} />
        )}
        {activeTab === "rules" && (
          <>
            <RulesAdmin
              isAdmin={isAdmin}
              tournament={tournaments.find((t) => t.id === currentTournamentId)}
            />
            {isAdmin && (disputedApprovals.length > 0 || matchesPendingApproval.length > 0) && (
              <div className="rounded-2xl border bg-card p-6 shadow-sm mt-6">
                <h2 className="mb-4 text-xl font-bold">Match Approvals</h2>
                {disputedApprovals.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">Disputed Results</h3>
                      <div className="space-y-3">
                        {disputedApprovals.map((approval) => (
                          <div key={approval.id} className="rounded-2xl border bg-muted/30 p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold">
                                  {approval.match?.player1?.display_name ?? "Player 1"} vs {approval.match?.player2?.display_name ?? "Player 2"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Score: {approval.match?.score1 ?? "-"} - {approval.match?.score2 ?? "-"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Reported by {approval.profile?.display_name ?? "unknown"}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => approval.profile_id && approveMatchResult.mutate({ approvalId: approval.id, matchId: approval.match_id, profileId: profile?.id ?? approval.profile_id })}
                                  disabled={approveMatchResult.isPending}
                                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                  Force Approval
                                </button>
                                <button
                                  onClick={() => approval.match && setReportMatch(approval.match)}
                                  disabled={!isAdmin && profile && approval.match && (approval.match.player1_id !== profile.id && approval.match.player2_id !== profile.id)}
                                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Set Score
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {matchesPendingApproval.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-lg font-semibold">Completed Results Needing Approval</h3>
                        <div className="space-y-3">
                          {matchesPendingApproval.map((match) => (
                            <div key={match.id} className="rounded-2xl border bg-muted/30 p-4">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="font-semibold">
                                    {match.player1?.display_name ?? "Player 1"} vs {match.player2?.display_name ?? "Player 2"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">Score: {match.score1 ?? "-"} - {match.score2 ?? "-"}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => profile && approveMatchResult.mutate({ matchId: match.id, profileId: profile.id })}
                                    disabled={approveMatchResult.isPending || !profile}
                                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                  >
                                    Approve Result
                                  </button>
                                  <button
                                    onClick={() => setReportMatch(match)}
                                    disabled={!isAdmin && profile && (match.player1_id !== profile.id && match.player2_id !== profile.id)}
                                    className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Edit Result
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {reportMatch && (
        <ReportScoreModal match={reportMatch} onClose={() => setReportMatch(null)} />
      )}
      {selectedPlayer && (
        <PlayerHistoryModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
};

export default Tournament;
