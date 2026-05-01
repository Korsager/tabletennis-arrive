import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useCreateTournament } from "@/hooks/useData";
import { DEFAULT_TOURNAMENT_RULES_DESCRIPTION } from "@/lib/tournamentDefaults";
import { toast } from "sonner";

const CreateTournament = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const createTournament = useCreateTournament();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState(DEFAULT_TOURNAMENT_RULES_DESCRIPTION);

  const handleCreateTournament = () => {
    if (!isAdmin) {
      toast.error("Only admins can create tournaments.");
      return;
    }

    if (!name.trim() || !startDate || !endDate) {
      toast.error("Please fill in all fields.");
      return;
    }

    createTournament.mutate(
      {
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        best_of: 5,
        group_count: null,
        playoff_size: null,
        rules: description,
      },
      {
        onSuccess: (data) => {
          toast.success("Tournament created successfully!");
          navigate(`/tournament/${data.id}`);
        },
        onError: () => toast.error("Failed to create tournament."),
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAdmin={isAdmin} isLoggedIn={!!user} onSignOut={signOut} userName={profile?.display_name} />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border bg-card p-8 shadow-sm">
          <h1 className="text-3xl font-bold">Create Tournament</h1>
          <p className="mt-2 text-muted-foreground">
            Create a new tournament and define the default structure, scoring, and playoff format.
          </p>

          <div className="mt-8 grid gap-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-bold text-muted-foreground">Tournament Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Spring 2026 League"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold text-muted-foreground">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold text-muted-foreground">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-muted-foreground">Default Rule Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={14}
                className="w-full rounded-lg border px-3 py-3 text-sm font-mono leading-6 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              onClick={handleCreateTournament}
              disabled={createTournament.isPending}
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {createTournament.isPending ? "Creating..." : "Create Tournament"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTournament;
