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
import { Match, Player } from "@/data/mockData";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("league");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState("t1");
  const [reportMatch, setReportMatch] = useState<Match | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
        selectedTournament={selectedTournament}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
        onToggleLogin={() => setIsLoggedIn(!isLoggedIn)}
        onSelectTournament={setSelectedTournament}
      />
      <TabMenu activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {activeTab === "league" && <LeagueTable />}
        {activeTab === "matches" && <MatchesView onReportScore={setReportMatch} />}
        {activeTab === "playoffs" && <PlayoffsView />}
        {activeTab === "rankings" && <PowerRankings onPlayerClick={setSelectedPlayer} />}
        {activeTab === "rules" && <RulesAdmin isAdmin={isAdmin} />}
      </main>

      {reportMatch && <ReportScoreModal match={reportMatch} onClose={() => setReportMatch(null)} />}
      {selectedPlayer && <PlayerHistoryModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
    </div>
  );
};

export default Index;
