import { useState } from "react";
import { Link } from "react-router-dom";
import { Swords } from "lucide-react";
import Navbar from "@/components/Navbar";
import ChallengeModal from "@/components/ChallengeModal";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments, useMatches, useProfiles, useChallengeMatches, MatchRow, ChallengeMatchRow } from "@/hooks/useData";

const Home = () => {
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();
  const { data: tournaments = [] } = useTournaments();
  const { data: profiles = [] } = useProfiles();
  const { data: challengeMatches = [] } = useChallengeMatches();

  const [showChallengeModal, setShowChallengeModal] = useState(false);

  // Get all tournament matches
  const allTournamentMatches: MatchRow[] = [];
  tournaments.forEach(tournament => {
    // We would need to fetch matches for all tournaments, but for now let's just show recent ones
  });

  const upcomingMatches = [
    ...challengeMatches.filter(m => m.status === 'pending' || m.status === 'accepted').slice(0, 10),
    // Add tournament matches that are scheduled but not completed
  ];

  const recentMatches = [
    ...challengeMatches.filter(m => m.status === 'completed').slice(0, 10),
    // Add completed tournament matches
  ];

  const activeTournament = tournaments.find(t => t.active);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAdmin={isAdmin}
        isLoggedIn={!!user}
        tournaments={tournaments}
        selectedTournament={activeTournament?.id ?? ""}
        onSelectTournament={() => {}} // Home doesn't need tournament selection
        onSignOut={signOut}
        userName={profile?.display_name}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Table Tennis Tournament Hub</h1>
              <p className="text-muted-foreground mt-2">
                Welcome to the Arrive Table Tennis League! Track matches, view rankings, and challenge opponents.
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowChallengeModal(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Swords size={16} />
                Challenge Player
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Upcoming Matches */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Upcoming Matches</h2>
            {upcomingMatches.length === 0 ? (
              <p className="text-muted-foreground">No upcoming matches scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <div className="font-semibold">
                          {match.challenger?.display_name} vs {match.challenged?.display_name}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(match.scheduled_at).toLocaleDateString()} at{' '}
                          {new Date(match.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {match.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Matches */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Recent Matches</h2>
            {recentMatches.length === 0 ? (
              <p className="text-muted-foreground">No recent matches completed.</p>
            ) : (
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <div className="font-semibold">
                          {match.challenger?.display_name} vs {match.challenged?.display_name}
                        </div>
                        <div className="text-muted-foreground">
                          {match.score1} - {match.score2}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(match.scheduled_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Tournament Info */}
        {activeTournament && (
          <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Active Tournament</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{activeTournament.name}</h3>
                <p className="text-muted-foreground">
                  {new Date(activeTournament.start_date).toLocaleDateString()} - {new Date(activeTournament.end_date).toLocaleDateString()}
                </p>
              </div>
              <Link to="/tournament" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                View Tournament
              </Link>
            </div>
          </div>
        )}
      </main>

      {showChallengeModal && (
        <ChallengeModal profiles={profiles} onClose={() => setShowChallengeModal(false)} />
      )}
    </div>
  );
};

export default Home;