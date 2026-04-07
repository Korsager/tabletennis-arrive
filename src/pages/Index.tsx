import { useState } from "react";
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
import { useTournaments, useMatches, useProfiles, usePlayoffMatches, MatchRow, ProfileRow } from "@/hooks/useData";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("league");
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();
  const { data: tournaments = [] } = useTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

  // Auto-select active tournament
  const activeTournament = tournaments.find((t) => t.active);
  const currentTournamentId = selectedTournamentId || activeTournament?.id || tournaments[0]?.id || null;

  const { data: matches = [] } = useMatches(currentTournamentId);
  const { data: profiles = [] } = useProfiles();
  const { data: playoffMatches = [] } = usePlayoffMatches(currentTournamentId);

  const [reportMatch, setReportMatch] = useState<MatchRow | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<ProfileRow | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAdmin={isAdmin}
        isLoggedIn={!!user}
        tournaments={tournaments}
        selectedTournament={currentTournamentId ?? ""}
        onSelectTournament={setSelectedTournamentId}
        onSignOut={signOut}
        userName={profile?.display_name}
      />
      <TabMenu activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {activeTab === "league" && (
          <LeagueTable
            matches={matches}
            profiles={profiles}
            isLoggedIn={!!user}
            userId={user?.id}
          />
        )}
        {activeTab === "matches" && (
          <MatchesView matches={matches} onReportScore={setReportMatch} />
        )}
        {activeTab === "playoffs" && (
          <PlayoffsView playoffMatches={playoffMatches} />
        )}
        {activeTab === "rankings" && (
          <PowerRankings profiles={profiles} onPlayerClick={setSelectedPlayer} />
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

export default Index;
