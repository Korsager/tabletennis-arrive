import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swords, Trophy, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import CreateCasualMatchModal from "@/components/CreateCasualMatchModal";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments, useMatches, useProfiles, useChallengeMatches, useRegisterForTournament, useTournamentParticipants, MatchRow, ChallengeMatchRow } from "@/hooks/useData";

const Home = () => {
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();
  const { data: tournaments = [] } = useTournaments();
  const { data: profiles = [] } = useProfiles();
  const { data: challengeMatches = [] } = useChallengeMatches();

  const [showChallengeModal, setShowChallengeModal] = useState(false);

  // Get active tournament
  const activeTournament = tournaments.find(t => t.active);
  
  // Get registration status
  const { data: participants = [] } = useTournamentParticipants(activeTournament?.id ?? null);
  const { mutate: registerForTournament, isPending: isRegistering } = useRegisterForTournament();
  
  const isRegisteredForActive = activeTournament && participants.some(p => p.profile_id === profile?.id);

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

  const upcomingTournaments = tournaments.filter(t => !t.active && new Date(t.start_date) > new Date()).sort((a, b) => 
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  const previousTournaments = tournaments.filter(t => !t.active).sort((a, b) => 
    new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
  );

  // Get top 5 players
  const top5Players = [...profiles]

    .sort((a, b) => (b.elo || 0) - (a.elo || 0))
    .slice(0, 5);

  const handleRegisterTournamentForUpcoming = (tournament: any) => {
    if (!profile) return;

    // Check if signup is still available
    if (!tournament.signup_deadline || new Date() >= new Date(tournament.signup_deadline)) {
      toast.error("Registration for this tournament has closed");
      return;
    }

    registerForTournament({
      tournament_id: tournament.id,
      profile_id: profile.id,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAdmin={isAdmin}
        isLoggedIn={!!user}
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
            <div className="flex flex-col gap-2">
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
        </div>

        {/* Main two-column layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Matches and Rankings */}
          <div className="lg:col-span-1 space-y-8">
            {/* Upcoming Matches */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Upcoming Matches</h2>
              {upcomingMatches.length === 0 ? (
                <p className="text-muted-foreground">No upcoming matches scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingMatches.slice(0, 5).map((match) => (
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

            {/* Top 5 Players */}
            {top5Players.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary" />
                    <h2 className="text-xl font-bold">Top 5 Players</h2>
                  </div>
                  <Link to="/rankings" className="text-sm font-semibold text-primary hover:underline">
                    View All →
                  </Link>
                </div>
                <div className="space-y-2">
                  {top5Players.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        <span className="text-sm font-medium">{player.display_name}</span>
                      </div>
                      <span className="text-sm font-semibold">{player.elo || 1200}</span>
                    </div>
                  ))}
                </div>
                <Link to="/rankings" className="mt-4 block text-center rounded-lg bg-muted px-4 py-2 text-sm font-semibold hover:bg-muted/80">
                  View Full Rankings
                </Link>
              </div>
            )}

            {/* Recent Matches */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Recent Matches</h2>
              {recentMatches.length === 0 ? (
                <p className="text-muted-foreground">No recent matches completed.</p>
              ) : (
                <div className="space-y-3">
                  {recentMatches.slice(0, 5).map((match) => (
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

          {/* Right Column - Tournament Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Tournament */}
            {activeTournament && (
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Active Tournament</h2>
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{activeTournament.name}</h3>
                    <p className="text-muted-foreground">
                      {new Date(activeTournament.start_date).toLocaleDateString()} - {new Date(activeTournament.end_date).toLocaleDateString()}
                    </p>
                    {activeTournament.signup_deadline && (
                      <p className={`text-sm mt-2 flex items-center gap-2 ${new Date() < new Date(activeTournament.signup_deadline) ? 'text-amber-600' : 'text-red-600'}`}>
                        <span className={`inline-block w-2 h-2 rounded-full ${new Date() < new Date(activeTournament.signup_deadline) ? 'bg-amber-600' : 'bg-red-600'}`}></span>
                        {new Date() < new Date(activeTournament.signup_deadline)
                          ? `Sign-up deadline: ${new Date(activeTournament.signup_deadline).toLocaleDateString()}`
                          : `Registration closed: ${new Date(activeTournament.signup_deadline).toLocaleDateString()}`
                        }
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link to="/tournament" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                      View Tournament
                    </Link>
                    {isRegisteredForActive && (
                      <div className="rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                        ✓ Registered
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Tournaments */}
            {upcomingTournaments.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Upcoming Tournaments</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {upcomingTournaments.map((tournament) => (
                    <div key={tournament.id} className="rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{tournament.name}</h3>
                          {tournament.description && (
                            <p className="text-muted-foreground text-sm mb-2">{tournament.description}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                          </p>
                          {tournament.signup_deadline && (
                            <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
                              <span className="inline-block w-2 h-2 bg-amber-600 rounded-full"></span>
                              Sign-up deadline: {new Date(tournament.signup_deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {user && tournament.signup_deadline && new Date() < new Date(tournament.signup_deadline) && (
                            <button
                              onClick={() => handleRegisterTournamentForUpcoming(tournament)}
                              disabled={isRegistering}
                              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-green-700 disabled:opacity-50"
                            >
                              {isRegistering ? "Registering..." : "Sign Up"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Tournaments */}
            {previousTournaments.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Previous Tournaments</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {previousTournaments.map((tournament) => (
                    <div key={tournament.id} className="rounded-lg border bg-muted/30 p-4">
                      <h3 className="font-semibold text-lg mb-2">{tournament.name}</h3>
                      {tournament.description && (
                        <p className="text-muted-foreground text-sm mb-2">{tournament.description}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showChallengeModal && profile && (
        <CreateCasualMatchModal
          currentProfileId={profile.id}
          onClose={() => setShowChallengeModal(false)}
        />
      )}
    </div>
  );
};

export default Home;