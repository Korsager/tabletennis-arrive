import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  useUpdateTournament,
  useTournamentParticipants,
  useAddTournamentParticipant,
  useRemoveTournamentParticipant,
  useUpdateTournamentParticipant,
  useProfiles,
} from "@/hooks/useData";
import { DEFAULT_TOURNAMENT_RULES_DESCRIPTION } from "@/lib/tournamentDefaults";

interface Tournament {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  active: boolean;
  description?: string;
  best_of?: number;
  group_count?: number | null;
  playoff_size?: number | null;
  rules?: string | null;
}

interface RulesAdminProps {
  isAdmin: boolean;
  tournament?: Tournament;
  onCreateTournament?: (archiveCurrentId?: string) => void;
}

const RulesAdmin = ({ isAdmin, tournament, onCreateTournament }: RulesAdminProps) => {
  // Editable settings state, hydrated from the current tournament
  const [name, setName] = useState(tournament?.name ?? "");
  const [startDate, setStartDate] = useState(tournament?.start_date ?? "");
  const [endDate, setEndDate] = useState(tournament?.end_date ?? "");
  const [bestOf, setBestOf] = useState<string>(String(tournament?.best_of ?? 5));
  const [groupCount, setGroupCount] = useState<string>(
    tournament?.group_count != null ? String(tournament.group_count) : ""
  );
  const [playoffSize, setPlayoffSize] = useState<string>(
    tournament?.playoff_size != null ? String(tournament.playoff_size) : ""
  );
  const [rulesText, setRulesText] = useState<string>(tournament?.rules ?? "");

  useEffect(() => {
    setName(tournament?.name ?? "");
    setStartDate(tournament?.start_date ?? "");
    setEndDate(tournament?.end_date ?? "");
    setBestOf(String(tournament?.best_of ?? 5));
    setGroupCount(tournament?.group_count != null ? String(tournament.group_count) : "");
    setPlayoffSize(tournament?.playoff_size != null ? String(tournament.playoff_size) : "");
    setRulesText(tournament?.rules ?? "");
  }, [tournament?.id]);

  const updateMutation = useUpdateTournament();
  const { data: participants = [] } = useTournamentParticipants(tournament?.id ?? null);
  const { data: allProfiles = [] } = useProfiles();
  const addParticipant = useAddTournamentParticipant();
  const removeParticipant = useRemoveTournamentParticipant();
  const updateParticipant = useUpdateTournamentParticipant();
  const queryClient = useQueryClient();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedMockData = async () => {
    if (!confirm("Create a new mock tournament with 8 test players, group matches and a playoff bracket?")) return;
    setIsSeeding(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc("seed_mock_data");
    setIsSeeding(false);
    if (error) {
      toast.error(error.message || "Failed to seed mock data");
      return;
    }
    toast.success("Mock tournament created");
    queryClient.invalidateQueries();
    console.log("Seeded tournament id:", data);
  };

  const [newProfileId, setNewProfileId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newSeed, setNewSeed] = useState("");

  const availableProfiles = allProfiles.filter(
    (p) => !participants.some((tp) => tp.profile_id === p.id)
  );

  const handleSaveSettings = () => {
    if (!tournament) return;
    const bestOfNum = parseInt(bestOf, 10);
    if (isNaN(bestOfNum) || bestOfNum < 1 || bestOfNum > 5) {
      toast.error("Best of must be between 1 and 5.");
      return;
    }
    updateMutation.mutate(
      {
        tournamentId: tournament.id,
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        best_of: bestOfNum,
        group_count: groupCount.trim() === "" ? null : parseInt(groupCount, 10),
        playoff_size: playoffSize === "" ? null : parseInt(playoffSize, 10),
        rules: rulesText,
      },
      {
        onSuccess: () => toast.success("Tournament settings saved"),
        onError: (err: Error) => toast.error(err.message || "Failed to save settings"),
      }
    );
  };

  const handleAddParticipant = () => {
    if (!tournament) return;
    if (!newProfileId) {
      toast.error("Pick a player to add.");
      return;
    }
    addParticipant.mutate(
      {
        tournament_id: tournament.id,
        profile_id: newProfileId,
        group_name: newGroupName.trim() === "" ? null : newGroupName.trim(),
        seed: newSeed.trim() === "" ? null : parseInt(newSeed, 10),
      },
      {
        onSuccess: () => {
          toast.success("Participant added");
          setNewProfileId("");
          setNewGroupName("");
          setNewSeed("");
        },
        onError: (err: Error) => toast.error(err.message || "Failed to add participant"),
      }
    );
  };

  const handleRemoveParticipant = (id: string) => {
    if (!tournament) return;
    removeParticipant.mutate(
      { id, tournament_id: tournament.id },
      {
        onSuccess: () => toast.success("Participant removed"),
        onError: (err: Error) => toast.error(err.message || "Failed to remove participant"),
      }
    );
  };

  const handleParticipantBlur = (
    id: string,
    field: "group_name" | "seed",
    value: string
  ) => {
    if (!tournament) return;
    const payload: {
      id: string;
      tournament_id: string;
      group_name?: string | null;
      seed?: number | null;
    } = { id, tournament_id: tournament.id };
    if (field === "group_name") payload.group_name = value.trim() === "" ? null : value.trim();
    if (field === "seed") payload.seed = value.trim() === "" ? null : parseInt(value, 10);
    updateParticipant.mutate(payload, {
      onError: (err: Error) => toast.error(err.message || "Failed to update participant"),
    });
  };

  const displayRules =
    tournament?.rules && tournament.rules.trim().length > 0
      ? tournament.rules
      : DEFAULT_TOURNAMENT_RULES_DESCRIPTION;

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-primary">Admin Panel</h2>
            <div className="flex gap-2">
              <button
                onClick={handleSeedMockData}
                disabled={isSeeding}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
              >
                {isSeeding ? "Seeding…" : "Seed Mock Data"}
              </button>
              <button
                onClick={() => onCreateTournament?.(undefined)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Create New Tournament
              </button>
            </div>
          </div>

          {tournament ? (
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground">Tournament Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted-foreground">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted-foreground">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted-foreground">Best Of</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={bestOf}
                    onChange={(e) => setBestOf(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted-foreground">Group Count</label>
                  <input
                    type="number"
                    min={1}
                    value={groupCount}
                    onChange={(e) => setGroupCount(e.target.value)}
                    placeholder="optional"
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted-foreground">Playoff Size</label>
                  <select
                    value={playoffSize}
                    onChange={(e) => setPlayoffSize(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">—</option>
                    <option value="4">4</option>
                    <option value="8">8</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground">Rules</label>
                <textarea
                  value={rulesText}
                  onChange={(e) => setRulesText(e.target.value)}
                  rows={10}
                  className="w-full rounded-lg border px-3 py-2 text-sm font-mono leading-6 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSaveSettings}
                  disabled={updateMutation.isPending}
                  className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-transform hover:scale-105 disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Tournament Settings"}
                </button>
                <button
                  onClick={() => onCreateTournament?.(tournament.id)}
                  className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted"
                >
                  Archive Current & Start New
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No tournament selected. Create a new one to get started.
            </p>
          )}
        </div>
      )}

      {isAdmin && tournament && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold text-primary">Tournament Participants</h2>

          {!tournament.active && (
          <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_120px_100px_auto]">
            <select
              value={newProfileId}
              onChange={(e) => setNewProfileId(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select player…</option>
              {availableProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name} ({p.elo})
                </option>
              ))}
            </select>
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group"
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="number"
              value={newSeed}
              onChange={(e) => setNewSeed(e.target.value)}
              placeholder="Seed"
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleAddParticipant}
              disabled={addParticipant.isPending || !newProfileId}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Add Participant
            </button>
          </div>
          )}

          {participants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No participants yet.</p>
          ) : (
            <div className="space-y-2">
              {participants.map((tp) => (
                <div
                  key={tp.id}
                  className="grid items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-sm sm:grid-cols-[1fr_120px_100px_auto]"
                >
                  <span className="font-semibold">{tp.profile.display_name}</span>
                  <input
                    defaultValue={tp.group_name ?? ""}
                    onBlur={(e) => {
                      if ((e.target.value || "") !== (tp.group_name ?? "")) {
                        handleParticipantBlur(tp.id, "group_name", e.target.value);
                      }
                    }}
                    placeholder="Group"
                    className="rounded-lg border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="number"
                    defaultValue={tp.seed ?? ""}
                    onBlur={(e) => {
                      const newVal = e.target.value;
                      const oldVal = tp.seed != null ? String(tp.seed) : "";
                      if (newVal !== oldVal) {
                        handleParticipantBlur(tp.id, "seed", newVal);
                      }
                    }}
                    placeholder="Seed"
                    className="rounded-lg border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={() => handleRemoveParticipant(tp.id)}
                    disabled={removeParticipant.isPending}
                    className="rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-extrabold text-primary">Tournament Info</h2>
        {tournament && (
          <div className="mb-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-muted px-3 py-1 font-semibold">{tournament.name}</span>
            <span className="text-muted-foreground">{tournament.start_date} → {tournament.end_date}</span>
          </div>
        )}

        <div className="grid gap-6">
          <div>
            <h3 className="mb-2 font-bold text-foreground">Format</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Best of {tournament?.best_of ?? 5}</li>
              {tournament?.group_count != null && <li>Groups: {tournament.group_count}</li>}
              {tournament?.playoff_size != null && <li>Playoff size: {tournament.playoff_size}</li>}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-bold text-foreground">Rule Description</h3>
            <pre className="whitespace-pre-wrap rounded-2xl bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
              {displayRules}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesAdmin;
