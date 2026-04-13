import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useData";

const PowerRankingsPage = () => {
  const { user, signOut, profile } = useAuth();
  const { data: profiles = [] } = useProfiles();
  const [visibleCount, setVisibleCount] = useState(50);

  // Sort profiles by ELO rating (descending)
  const sortedProfiles = [...profiles]
    .sort((a, b) => (b.elo || 0) - (a.elo || 0));

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAdmin={profile?.id ? false : false}
        isLoggedIn={!!user}
        onSignOut={signOut}
        userName={profile?.display_name}
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Power Rankings</h1>
            <p className="text-muted-foreground mt-2">
              Current player rankings based on ELO rating
            </p>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Rank</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Player</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">ELO</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedProfiles.slice(0, visibleCount).map((profile, index) => (
                  <tr
                    key={profile.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold">#{index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">{profile.display_name}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold">{profile.elo || 1200}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ArrowUpRight size={16} className="text-green-500" />
                        <span className="text-sm text-green-500">+12</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Load More Button */}
        {visibleCount < sortedProfiles.length && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 50)}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Load More
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Showing {Math.min(visibleCount, sortedProfiles.length)} of{" "}
          {sortedProfiles.length} players
        </div>
      </main>
    </div>
  );
};

export default PowerRankingsPage;
