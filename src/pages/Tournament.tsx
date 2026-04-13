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
import { useTournaments, useMatches, useProfiles, usePlayoffMatches, MatchRow, ProfileRow, useTournamentRules, useChallengeMatches, useTournamentParticipants } from "@/hooks/useData";

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
          <MatchesView matches={matches} challengeMatches={challengeMatches} onReportScore={setReportMatch} />
        )}
        {activeTab === "playoffs" && (
          <PlayoffsView playoffMatches={playoffMatches} />
        )}
        {activeTab === "rankings" && (
          <PowerRankings profiles={tournamentParticipants.map(tp => tp.profile).filter(Boolean)} onPlayerClick={setSelectedPlayer} />
        )}
        {activeTab === "rules" && (
          <RulesAdmin
            isAdmin={isAdmin}
            tournament={tournaments.find((t) => t.id === currentTournamentId)}
          />
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
