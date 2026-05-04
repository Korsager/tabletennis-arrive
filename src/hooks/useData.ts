import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { players as mockPlayers, tournaments as mockTournaments, tournamentParticipants as mockTournamentParticipants, matches as mockMatches, playoffBracket as mockPlayoffBracket, challengeMatches as mockChallengeMatches, matchApprovals as mockMatchApprovals, rules as mockRules } from "@/data/mockData";

// Cast the Supabase client to `any` for legacy hooks that reference columns or
// tables not yet present in the generated types (visible_in_ranking,
// challenge_matches, match_approvals, signup_deadline, etc.).
// New hooks added in this phase use `supabaseTyped` for proper typing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = supabaseClient;
const supabaseTyped = supabaseClient;

// Types for joined data
export interface ProfileRow {
  id: string;
  user_id?: string;
  display_name: string;
  elo: number;
  visible_in_ranking?: boolean;
}

export interface MatchRow {
  id: string;
  tournament_id: string;
  round: number;
  player1_id: string | null;
  player2_id: string | null;
  score1: number | null;
  score2: number | null;
  status: string;
  forfeit_by: string | null;
  scheduled_at: string | null;
  match_type: string;
  group_name: string | null;
  best_of: number;
  winner_id: string | null;
  player1: { id: string; display_name: string } | null;
  player2: { id: string; display_name: string } | null;
}

export interface PlayoffMatchRow {
  id: string;
  tournament_id: string;
  round: string;
  player1_id: string | null;
  player2_id: string | null;
  score1: number | null;
  score2: number | null;
  winner_id: string | null;
  scheduled_at: string | null;
  best_of: number;
  bracket_slot: number | null;
  feeds_into_slot: number | null;
  feeds_into_position: string | null;
  player1: { id: string; display_name: string } | null;
  player2: { id: string; display_name: string } | null;
  winner: { id: string; display_name: string } | null;
}

export interface ChallengeMatchRow {
  id: string;
  challenger_id: string;
  challenged_id: string;
  scheduled_at: string;
  status: string;
  score1: number | null;
  score2: number | null;
  winner_id: string | null;
  match_format?: string;
  challenger: { id: string; display_name: string; elo: number };
  challenged: { id: string; display_name: string; elo: number };
  winner: { id: string; display_name: string } | null;
}

export interface TournamentParticipantRow {
  id: string;
  tournament_id: string;
  profile_id: string;
  group_name: string | null;
  seed: number | null;
  joined_at?: string;
  profile: ProfileRow;
}

export interface TournamentRulesRow {
  id: string;
  tournament_id: string;
  group_stage_games: number;
  playoff_games: number;
  win_points: number;
  draw_points: number;
  loss_points: number;
  forfeit_points: number;
}

export const useTournaments = () =>
  useQuery({
    queryKey: ["tournaments", "v4"], // Updated version
    queryFn: async () => {
      // Force mock data for now to bypass database
      return mockTournaments.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        start_date: t.startDate,
        end_date: t.endDate,
        active: t.active,
        signup_deadline: t.signup_deadline,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      }));
    },
  });

export const useProfiles = () =>
  useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, user_id, display_name, elo")
          .order("elo", { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
          // Fall back to mock data only when DB is truly empty
          return mockPlayers.map(player => ({
            id: player.id,
            user_id: player.id, // Mock user_id
            display_name: player.name,
            elo: player.elo,
            visible_in_ranking: player.visible_in_ranking ?? true,
          })) as ProfileRow[];
        }

        return data.map((d: any) => ({ ...d, visible_in_ranking: true })) as ProfileRow[];
      } catch (err) {
        // Fall back to mock data on any error
        return mockPlayers.map(player => ({
          id: player.id,
          user_id: player.id, // Mock user_id
          display_name: player.name,
          elo: player.elo,
          visible_in_ranking: player.visible_in_ranking ?? true,
        })) as ProfileRow[];
      }
    },
  });

export const useMatches = (tournamentId: string | null) =>
  useQuery({
    queryKey: ["matches", tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      // Force mock data for now to bypass database
      const tournamentMatches = mockMatches.filter(m => {
        // For active tournament (t1), return all matches
        // For finished tournament (t4), return winter2025Matches
        if (tournamentId === "t1") return true;
        if (tournamentId === "t4") return m.id.startsWith("wm");
        return false;
      });

      return tournamentMatches.map(m => ({
        id: m.id,
        tournament_id: tournamentId!,
        round: m.round,
        player1_id: m.player1,
        player2_id: m.player2,
        score1: m.score1,
        score2: m.score2,
        status: m.status,
        forfeit_by: m.forfeitBy,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
        player1: { id: m.player1, display_name: mockPlayers.find(p => p.id === m.player1)?.name || "" },
        player2: { id: m.player2, display_name: mockPlayers.find(p => p.id === m.player2)?.name || "" },
      })) as unknown as MatchRow[];
    },
  });

export const usePlayoffMatches = (tournamentId: string | null) =>
  useQuery({
    queryKey: ["playoff_matches", tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      try {
        const { data, error } = await supabaseTyped
          .from("playoff_matches")
          .select(
            "*, player1:profiles!playoff_matches_player1_id_fkey(id, display_name), player2:profiles!playoff_matches_player2_id_fkey(id, display_name), winner:profiles!playoff_matches_winner_id_fkey(id, display_name)"
          )
          .eq("tournament_id", tournamentId!)
          .order("bracket_slot", { ascending: true });
        if (error) throw error;
        return (data ?? []) as unknown as PlayoffMatchRow[];
      } catch {
        // Fallback to mock for demo tournaments
        const tournamentPlayoffs = tournamentId === "t1" ? mockPlayoffBracket : [];
        return tournamentPlayoffs.map((p) => ({
          id: p.id,
          tournament_id: tournamentId!,
          round: p.round,
          player1_id: p.player1,
          player2_id: p.player2,
          score1: p.score1,
          score2: p.score2,
          winner_id: p.winner,
          scheduled_at: null,
          best_of: 5,
          bracket_slot: null,
          feeds_into_slot: null,
          feeds_into_position: null,
          player1: p.player1 ? { id: p.player1, display_name: mockPlayers.find(pl => pl.id === p.player1)?.name || "" } : null,
          player2: p.player2 ? { id: p.player2, display_name: mockPlayers.find(pl => pl.id === p.player2)?.name || "" } : null,
          winner: p.winner ? { id: p.winner, display_name: mockPlayers.find(pl => pl.id === p.winner)?.name || "" } : null,
        })) as unknown as PlayoffMatchRow[];
      }
    },
  });

export const useChallengeMatches = () =>
  useQuery({
    queryKey: ["challenge_matches"],
    queryFn: async () => {
      // Force mock data for now to bypass database
      return mockChallengeMatches.map(c => ({
        id: c.id,
        challenger_id: c.challenger_id,
        challenged_id: c.challenged_id,
        scheduled_at: c.scheduled_at,
        status: c.status,
        score1: c.score1,
        score2: c.score2,
        winner_id: c.winner_id,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
        challenger: c.challenger,
        challenged: c.challenged,
        winner: c.winner,
      })) as ChallengeMatchRow[];
    },
  });

export const useTournamentParticipants = (tournamentId: string | null) =>
  useQuery({
    queryKey: ["tournament_participants", tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      const { data, error } = await supabaseTyped
        .from("tournament_participants")
        .select("id, tournament_id, profile_id, group_name, seed, profile:profiles!tournament_participants_profile_id_fkey(id, user_id, display_name, elo)")
        .eq("tournament_id", tournamentId!);

      if (error || !data || data.length === 0) {
        // Fall back to mock data so UI still works while DB is empty
        const participants = mockTournamentParticipants.filter(tp => tp.tournament_id === tournamentId);
        return participants.map(tp => ({
          id: tp.id,
          tournament_id: tp.tournament_id,
          profile_id: tp.profile_id,
          group_name: null,
          seed: null,
          profile: {
            id: tp.profile.id,
            user_id: tp.profile.id,
            display_name: tp.profile.display_name,
            elo: tp.profile.elo,
            visible_in_ranking: true,
          },
        })) as TournamentParticipantRow[];
      }

      return (data as unknown as Array<{
        id: string;
        tournament_id: string;
        profile_id: string;
        group_name: string | null;
        seed: number | null;
        profile: { id: string; user_id: string; display_name: string; elo: number };
      }>).map(row => ({
        ...row,
        profile: { ...row.profile, visible_in_ranking: true },
      })) as TournamentParticipantRow[];
    },
  });

export const useTournamentRules = (tournamentId: string | null) =>
  useQuery({
    queryKey: ["tournament_rules", tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      // Force mock data for now to bypass database
      return {
        id: "rules_" + tournamentId,
        tournament_id: tournamentId!,
        group_stage_games: 3,
        playoff_games: 5,
        win_points: 3,
        draw_points: 1,
        loss_points: 0,
        forfeit_points: -1,
      } as TournamentRulesRow;
    },
  });

export const useMatchGames = (matchId: string | null) =>
  useQuery({
    queryKey: ["match_games", matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_games")
        .select("*")
        .eq("match_id", matchId!)
        .order("game_number");
      if (error) throw error;
      return data;
    },
  });

export const useMatchApprovals = (matchId: string | null) =>
  useQuery({
    queryKey: ["match_approvals", matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_approvals")
        .select("*")
        .eq("match_id", matchId!);
      if (error) throw error;
      return data;
    },
  });

export const useUpdateMatchScore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      score1,
      score2,
      forfeitBy,
    }: {
      matchId: string;
      score1: number;
      score2: number;
      forfeitBy?: string | null;
    }) => {
      const { error } = await supabase
        .from("matches")
        .update({
          score1,
          score2,
          status: "Completed",
          forfeit_by: forfeitBy ?? null,
        })
        .eq("id", matchId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
};

export const useRegisterPlayer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, displayName }: { userId: string; displayName: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

export const useRegisterForTournament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tournament_id, profile_id }: { tournament_id: string; profile_id: string }) => {
      const { error } = await supabase
        .from("tournament_participants")
        .insert({ tournament_id, profile_id });
      if (error) throw error;
    },
    onSuccess: (_, { tournament_id }) => {
      queryClient.invalidateQueries({ queryKey: ["tournament_participants", tournament_id] });
    },
  });
};

export const useUpdateRankingVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, visible }: { userId: string; visible: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ visible_in_ranking: visible })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

export const useCreateChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      challengerId,
      challengedId,
      scheduledAt,
      matchFormat,
    }: {
      challengerId: string;
      challengedId: string;
      scheduledAt: string;
      matchFormat?: string;
    }) => {
      const { error } = await supabase
        .from("challenge_matches")
        .insert({
          challenger_id: challengerId,
          challenged_id: challengedId,
          scheduled_at: scheduledAt,
          match_format: matchFormat || "BO3",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge_matches"] });
    },
  });
};

export const useJoinTournament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tournamentId,
      profileId,
    }: {
      tournamentId: string;
      profileId: string;
    }) => {
      const { error } = await supabase
        .from("tournament_participants")
        .insert({
          tournament_id: tournamentId,
          profile_id: profileId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournament_participants"] });
    },
  });
};

export const useCreateTournament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      start_date,
      end_date,
      best_of,
      group_count,
      playoff_size,
      rules,
      archiveCurrentId,
    }: {
      name: string;
      start_date: string;
      end_date: string;
      best_of: number;
      group_count: number | null;
      playoff_size: number | null;
      rules: string;
      archiveCurrentId?: string;
    }) => {
      if (archiveCurrentId) {
        const { error: archiveError } = await supabaseTyped
          .from("tournaments")
          .update({ active: false })
          .eq("id", archiveCurrentId);
        if (archiveError) throw archiveError;
      }

      const { data, error } = await supabaseTyped
        .from("tournaments")
        .insert({
          name,
          start_date,
          end_date,
          best_of,
          group_count,
          playoff_size,
          rules,
          active: true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
};

export interface MatchApprovalRow {
  id: string;
  match_id: string;
  profile_id: string;
  approved: boolean;
  approved_at: string;
  profile?: { id: string; display_name: string };
  match?: MatchRow;
}

export const useTournamentMatchApprovals = (tournamentId: string | null) =>
  useQuery({
    queryKey: ["tournament_match_approvals", tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      // Force mock data for now to bypass database
      const tournamentMatches = mockMatches.filter(m => {
        if (tournamentId === "t1") return true;
        if (tournamentId === "t4") return m.id.startsWith("wm");
        return false;
      });

      const approvals = mockMatchApprovals.filter(ma =>
        tournamentMatches.some(m => m.id === ma.match_id)
      );

      return approvals.map(ma => {
        const match = tournamentMatches.find(m => m.id === ma.match_id)!;
        return {
          id: ma.id,
          match_id: ma.match_id,
          profile_id: ma.profile_id,
          approved: ma.approved,
          approved_at: ma.approved_at,
          profile: { id: ma.profile_id, display_name: mockPlayers.find(p => p.id === ma.profile_id)?.name || "" },
          match: {
            id: match.id,
            round: match.round,
            status: match.status,
            score1: match.score1,
            score2: match.score2,
            player1_id: match.player1,
            player2_id: match.player2,
            player1: { id: match.player1, display_name: mockPlayers.find(p => p.id === match.player1)?.name || "" },
            player2: { id: match.player2, display_name: mockPlayers.find(p => p.id === match.player2)?.name || "" },
            tournament_id: tournamentId!,
          },
        };
      }) as MatchApprovalRow[];
    },
  });

export const useApproveMatchResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      approvalId,
      matchId,
      profileId,
    }: {
      approvalId?: string;
      matchId: string;
      profileId: string;
    }) => {
      if (approvalId) {
        const { error } = await supabase
          .from("match_approvals")
          .update({ approved: true, approved_at: new Date().toISOString() })
          .eq("id", approvalId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("match_approvals")
          .insert({
            match_id: matchId,
            profile_id: profileId,
            approved: true,
            approved_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournament_match_approvals"] });
      queryClient.invalidateQueries({ queryKey: ["match_approvals"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
};

export const useUpdateProfileVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ profileId, visible }: { profileId: string; visible: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ visible_in_ranking: visible })
        .eq("id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

// Compute league standings from matches
export interface Standing {
  profileId: string;
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  forfeits: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
  elo: number;
}

export function computeStandings(
  matches: MatchRow[],
  profiles: ProfileRow[],
  rules?: TournamentRulesRow
): Standing[] {
  const map = new Map<string, Standing>();

  for (const p of profiles) {
    map.set(p.id, {
      profileId: p.id,
      name: p.display_name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      forfeits: 0,
      gamesWon: 0,
      gamesLost: 0,
      points: 0,
      elo: p.elo,
    });
  }

  const winPoints = rules?.win_points ?? 3;
  const drawPoints = rules?.draw_points ?? 1;
  const lossPoints = rules?.loss_points ?? 0;
  const forfeitPoints = rules?.forfeit_points ?? -1;

  for (const m of matches) {
    if (m.status !== "Completed" || !m.player1_id || !m.player2_id) continue;
    const s1 = map.get(m.player1_id);
    const s2 = map.get(m.player2_id);
    if (!s1 || !s2) continue;

    s1.played++;
    s2.played++;
    s1.gamesWon += m.score1 ?? 0;
    s1.gamesLost += m.score2 ?? 0;
    s2.gamesWon += m.score2 ?? 0;
    s2.gamesLost += m.score1 ?? 0;

    if (m.forfeit_by) {
      if (m.forfeit_by === m.player1_id) {
        s1.forfeits++;
        s1.points += forfeitPoints;
        s2.wins++;
        s2.points += winPoints;
      } else {
        s2.forfeits++;
        s2.points += forfeitPoints;
        s1.wins++;
        s1.points += winPoints;
      }
    } else if ((m.score1 ?? 0) > (m.score2 ?? 0)) {
      s1.wins++;
      s1.points += winPoints;
      s2.losses++;
      s2.points += lossPoints;
    } else if ((m.score1 ?? 0) < (m.score2 ?? 0)) {
      s2.wins++;
      s2.points += winPoints;
      s1.losses++;
      s1.points += lossPoints;
    } else {
      s1.draws++;
      s2.draws++;
      s1.points += drawPoints;
      s2.points += drawPoints;
    }
  }

  return Array.from(map.values())
    .filter((s) => s.played > 0)
    .sort((a, b) => b.points - a.points || (b.gamesWon - b.gamesLost) - (a.gamesWon - a.gamesLost));
}

// ----- Phase 2: Tournament admin mutations -----

export const useUpdateTournament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tournamentId,
      ...fields
    }: {
      tournamentId: string;
      name?: string;
      start_date?: string;
      end_date?: string;
      best_of?: number;
      group_count?: number | null;
      playoff_size?: number | null;
      rules?: string;
    }) => {
      const update: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(fields)) {
        if (v !== undefined) update[k] = v;
      }
      const { error } = await supabaseTyped
        .from("tournaments")
        .update(update as never)
        .eq("id", tournamentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
};

export const useAddTournamentParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tournament_id,
      profile_id,
      group_name,
      seed,
    }: {
      tournament_id: string;
      profile_id: string;
      group_name?: string | null;
      seed?: number | null;
    }) => {
      const { error } = await supabaseTyped
        .from("tournament_participants")
        .insert({
          tournament_id,
          profile_id,
          group_name: group_name ?? null,
          seed: seed ?? null,
        });
      if (error) throw error;
    },
    onSuccess: (_, { tournament_id }) => {
      queryClient.invalidateQueries({ queryKey: ["tournament_participants", tournament_id] });
    },
  });
};

export const useRemoveTournamentParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; tournament_id: string }) => {
      const { error } = await supabaseTyped
        .from("tournament_participants")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { tournament_id }) => {
      queryClient.invalidateQueries({ queryKey: ["tournament_participants", tournament_id] });
    },
  });
};

export const useUpdateTournamentParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      group_name,
      seed,
    }: {
      id: string;
      tournament_id: string;
      group_name?: string | null;
      seed?: number | null;
    }) => {
      const update: Record<string, unknown> = {};
      if (group_name !== undefined) update.group_name = group_name;
      if (seed !== undefined) update.seed = seed;
      const { error } = await supabaseTyped
        .from("tournament_participants")
        .update(update as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { tournament_id }) => {
      queryClient.invalidateQueries({ queryKey: ["tournament_participants", tournament_id] });
    },
  });
};

// ----- Phase 3: Match scheduling & per-game scoring -----

/**
 * Round-robin "circle method" pairings for a list of player ids.
 * Returns array of rounds, each round is an array of [p1, p2] pairs.
 */
function circleMethodPairings(playerIds: string[]): Array<Array<[string, string]>> {
  const players = [...playerIds];
  if (players.length < 2) return [];
  const hasBye = players.length % 2 === 1;
  if (hasBye) players.push("__BYE__");
  const n = players.length;
  const numRounds = n - 1;
  const half = n / 2;
  const rounds: Array<Array<[string, string]>> = [];
  const arr = [...players];
  for (let r = 0; r < numRounds; r++) {
    const pairs: Array<[string, string]> = [];
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a !== "__BYE__" && b !== "__BYE__") pairs.push([a, b]);
    }
    rounds.push(pairs);
    // rotate (keep first fixed)
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop()!);
    arr.splice(0, arr.length, fixed, ...rest);
  }
  return rounds;
}

export const useGenerateGroupMatches = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tournament_id }: { tournament_id: string }) => {
      // 1. Tournament best_of
      const { data: tournament, error: tErr } = await supabaseTyped
        .from("tournaments")
        .select("best_of")
        .eq("id", tournament_id)
        .single();
      if (tErr) throw tErr;
      const bestOf = tournament?.best_of ?? 5;

      // 2. Existing group matches
      const { data: existing, error: exErr } = await supabaseTyped
        .from("matches")
        .select("id")
        .eq("tournament_id", tournament_id)
        .eq("match_type", "group");
      if (exErr) throw exErr;
      if (existing && existing.length > 0) {
        throw new Error(
          "Group matches already generated for this tournament. Delete existing matches first."
        );
      }

      // 3. Participants
      const { data: parts, error: pErr } = await supabaseTyped
        .from("tournament_participants")
        .select("profile_id, group_name")
        .eq("tournament_id", tournament_id);
      if (pErr) throw pErr;
      if (!parts || parts.length < 2) {
        throw new Error("Need at least 2 participants to generate matches.");
      }

      // 4. Group by group_name
      const groups = new Map<string | null, string[]>();
      for (const p of parts) {
        const key = p.group_name ?? null;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(p.profile_id);
      }

      // 5. Build matches
      const toInsert: Array<{
        tournament_id: string;
        match_type: string;
        group_name: string | null;
        round: number;
        player1_id: string;
        player2_id: string;
        best_of: number;
        status: string;
        scheduled_at: null;
      }> = [];
      for (const [groupName, playerIds] of groups.entries()) {
        const rounds = circleMethodPairings(playerIds);
        rounds.forEach((pairs, idx) => {
          for (const [p1, p2] of pairs) {
            toInsert.push({
              tournament_id,
              match_type: "group",
              group_name: groupName,
              round: idx + 1,
              player1_id: p1,
              player2_id: p2,
              best_of: bestOf,
              status: "Pending",
              scheduled_at: null,
            });
          }
        });
      }

      if (toInsert.length === 0) {
        throw new Error("No matches generated — check participant groups.");
      }

      const { error: insErr } = await supabaseTyped
        .from("matches")
        .insert(toInsert as never);
      if (insErr) throw insErr;
      return { count: toInsert.length };
    },
    onSuccess: (_, { tournament_id }) => {
      queryClient.invalidateQueries({ queryKey: ["matches", tournament_id] });
    },
  });
};

export const useDeleteAllGroupMatches = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tournament_id }: { tournament_id: string }) => {
      const { error } = await supabaseTyped
        .from("matches")
        .delete()
        .eq("tournament_id", tournament_id)
        .eq("match_type", "group");
      if (error) throw error;
    },
    onSuccess: (_, { tournament_id }) => {
      queryClient.invalidateQueries({ queryKey: ["matches", tournament_id] });
    },
  });
};

export const useUpdateMatchSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      scheduled_at,
    }: {
      matchId: string;
      scheduled_at: string | null;
      tournamentId: string | null;
    }) => {
      const { error } = await supabaseTyped
        .from("matches")
        .update({ scheduled_at } as never)
        .eq("id", matchId);
      if (error) throw error;
    },
    onSuccess: (_, { tournamentId }) => {
      queryClient.invalidateQueries({ queryKey: ["matches", tournamentId] });
    },
  });
};

export interface ReportMatchGameInput {
  game_number: number;
  p1_score: number;
  p2_score: number;
}

export const useReportMatchScore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      games,
      forfeitBy,
    }: {
      matchId: string;
      games: ReportMatchGameInput[];
      forfeitBy?: string | null;
      tournamentId: string | null;
    }) => {
      // Validate
      if (games.length < 1 || games.length > 5) {
        throw new Error("Must report between 1 and 5 games.");
      }
      const sortedGames = [...games].sort((a, b) => a.game_number - b.game_number);
      for (let i = 0; i < sortedGames.length; i++) {
        if (sortedGames[i].game_number !== i + 1) {
          throw new Error("Game numbers must be contiguous starting from 1.");
        }
      }

      // Compute totals
      let score1 = 0;
      let score2 = 0;
      for (const g of sortedGames) {
        if (g.p1_score > g.p2_score) score1++;
        else if (g.p2_score > g.p1_score) score2++;
      }

      // Fetch match for player ids
      const { data: match, error: mErr } = await supabaseTyped
        .from("matches")
        .select("player1_id, player2_id")
        .eq("id", matchId)
        .single();
      if (mErr) throw mErr;

      let winner_id: string | null = null;
      if (forfeitBy) {
        winner_id =
          forfeitBy === match.player1_id
            ? match.player2_id
            : forfeitBy === match.player2_id
            ? match.player1_id
            : null;
      } else if (score1 > score2) {
        winner_id = match.player1_id;
      } else if (score2 > score1) {
        winner_id = match.player2_id;
      }

      // Replace match_games
      const { error: delErr } = await supabaseTyped
        .from("match_games")
        .delete()
        .eq("match_id", matchId);
      if (delErr) throw delErr;

      const gameRows = sortedGames.map((g) => ({
        match_id: matchId,
        game_number: g.game_number,
        p1_score: g.p1_score,
        p2_score: g.p2_score,
      }));
      const { error: insErr } = await supabaseTyped
        .from("match_games")
        .insert(gameRows as never);
      if (insErr) throw insErr;

      // Update match row
      const { error: updErr } = await supabaseTyped
        .from("matches")
        .update({
          score1,
          score2,
          status: "Completed",
          winner_id,
          forfeit_by: forfeitBy ?? null,
        } as never)
        .eq("id", matchId);
      if (updErr) throw updErr;
    },
    onSuccess: (_, { tournamentId, matchId }) => {
      queryClient.invalidateQueries({ queryKey: ["matches", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["match_games", matchId] });
    },
  });
};

// ----- Phase 4: Playoff bracket -----

export const usePlayoffMatchGames = (playoffMatchId: string | null) =>
  useQuery({
    queryKey: ["match_games", "playoff", playoffMatchId],
    enabled: !!playoffMatchId,
    queryFn: async () => {
      const { data, error } = await supabaseTyped
        .from("match_games")
        .select("*")
        .eq("playoff_match_id", playoffMatchId!)
        .order("game_number");
      if (error) throw error;
      return data ?? [];
    },
  });

export const useTournamentPlayoffGames = (tournamentId: string | null) =>
  useQuery({
    queryKey: ["match_games", "tournament-playoff", tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      const { data: pm, error: pmErr } = await supabaseTyped
        .from("playoff_matches")
        .select("id")
        .eq("tournament_id", tournamentId!);
      if (pmErr) throw pmErr;
      const ids = (pm ?? []).map((m) => m.id);
      if (ids.length === 0) return [];
      const { data, error } = await supabaseTyped
        .from("match_games")
        .select("*")
        .in("playoff_match_id", ids)
        .order("game_number");
      if (error) throw error;
      return data ?? [];
    },
  });

/**
 * Computes seeded standings for a tournament's group stage.
 * Returns players sorted best-first, optionally with their group_name.
 */
async function fetchTournamentStandings(tournamentId: string): Promise<
  Array<{ profile_id: string; group_name: string | null; points: number; gameDiff: number; display_name: string }>
> {
  const { data: parts, error: pErr } = await supabaseTyped
    .from("tournament_participants")
    .select("profile_id, group_name, profile:profiles!tournament_participants_profile_id_fkey(id, display_name, elo)")
    .eq("tournament_id", tournamentId);
  if (pErr) throw pErr;

  const { data: matches, error: mErr } = await supabaseTyped
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("match_type", "group");
  if (mErr) throw mErr;

  type Row = { profile_id: string; group_name: string | null; display_name: string; played: number; points: number; gameDiff: number; elo: number };
  const stats = new Map<string, Row>();
  for (const p of (parts ?? []) as Array<{ profile_id: string; group_name: string | null; profile: { id: string; display_name: string; elo: number } | null }>) {
    stats.set(p.profile_id, {
      profile_id: p.profile_id,
      group_name: p.group_name,
      display_name: p.profile?.display_name ?? "",
      played: 0,
      points: 0,
      gameDiff: 0,
      elo: p.profile?.elo ?? 1200,
    });
  }

  for (const m of (matches ?? []) as Array<{ status: string; player1_id: string | null; player2_id: string | null; score1: number | null; score2: number | null; forfeit_by: string | null }>) {
    if (m.status !== "Completed" || !m.player1_id || !m.player2_id) continue;
    const s1 = stats.get(m.player1_id);
    const s2 = stats.get(m.player2_id);
    if (!s1 || !s2) continue;
    const a = m.score1 ?? 0;
    const b = m.score2 ?? 0;
    s1.played++; s2.played++;
    s1.gameDiff += a - b;
    s2.gameDiff += b - a;
    if (m.forfeit_by === m.player1_id) { s2.points += 3; s1.points -= 1; }
    else if (m.forfeit_by === m.player2_id) { s1.points += 3; s2.points -= 1; }
    else if (a > b) s1.points += 3;
    else if (b > a) s2.points += 3;
    else { s1.points += 1; s2.points += 1; }
  }

  return Array.from(stats.values())
    .sort((a, b) => b.points - a.points || b.gameDiff - a.gameDiff || b.elo - a.elo)
    .map((s) => ({
      profile_id: s.profile_id,
      group_name: s.group_name,
      points: s.points,
      gameDiff: s.gameDiff,
      display_name: s.display_name,
    }));
}

export const useTournamentStandingsPreview = (tournamentId: string | null) =>
  useQuery({
    queryKey: ["tournament_standings", tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => fetchTournamentStandings(tournamentId!),
  });

/**
 * Pick top players by group: top N from each group, then fill from leftover globally.
 * Returns exactly `size` profile_ids in seed order (1..size).
 */
function selectSeeds(
  standings: Array<{ profile_id: string; group_name: string | null }>,
  size: number
): string[] | null {
  if (standings.length < size) return null;
  const groups = new Map<string, Array<{ profile_id: string }>>();
  for (const s of standings) {
    const key = s.group_name ?? "__default__";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }
  const groupKeys = Array.from(groups.keys());
  if (groupKeys.length <= 1) {
    return standings.slice(0, size).map((s) => s.profile_id);
  }
  const perGroup = Math.floor(size / groupKeys.length);
  const seeded: string[] = [];
  const remainingPool: string[] = [];
  for (const k of groupKeys) {
    const arr = groups.get(k)!;
    seeded.push(...arr.slice(0, perGroup).map((s) => s.profile_id));
    remainingPool.push(...arr.slice(perGroup).map((s) => s.profile_id));
  }
  // Need to interleave by overall standings order to preserve seeding
  const seededSet = new Set(seeded);
  const orderedSeeded = standings.filter((s) => seededSet.has(s.profile_id)).map((s) => s.profile_id);
  // Fill remaining
  while (orderedSeeded.length < size && remainingPool.length > 0) {
    const next = standings.find((s) => remainingPool.includes(s.profile_id) && !orderedSeeded.includes(s.profile_id));
    if (!next) break;
    orderedSeeded.push(next.profile_id);
  }
  return orderedSeeded.length >= size ? orderedSeeded.slice(0, size) : null;
}

export const useGeneratePlayoffBracket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tournament_id, size }: { tournament_id: string; size: 4 | 8 }) => {
      // Existing playoff matches?
      const { data: existing, error: exErr } = await supabaseTyped
        .from("playoff_matches")
        .select("id")
        .eq("tournament_id", tournament_id);
      if (exErr) throw exErr;
      if (existing && existing.length > 0) {
        throw new Error("Playoff bracket already exists. Delete existing first.");
      }

      const { data: tournament, error: tErr } = await supabaseTyped
        .from("tournaments")
        .select("best_of")
        .eq("id", tournament_id)
        .single();
      if (tErr) throw tErr;
      const bestOf = tournament?.best_of ?? 5;

      const standings = await fetchTournamentStandings(tournament_id);
      const seeds = selectSeeds(standings, size);
      if (!seeds) {
        throw new Error(`Not enough completed group results to seed a ${size}-player bracket.`);
      }
      // seeds[0] is seed 1, seeds[1] is seed 2, etc.
      const s = (n: number) => seeds[n - 1];

      type Row = {
        tournament_id: string;
        round: string;
        player1_id: string | null;
        player2_id: string | null;
        best_of: number;
        scheduled_at: null;
        bracket_slot: number;
        feeds_into_slot: number | null;
        feeds_into_position: string | null;
      };
      const rows: Row[] = [];

      if (size === 4) {
        // SF1=slot1 (1v4), SF2=slot2 (2v3), Final=slot3
        rows.push({ tournament_id, round: "SF", player1_id: s(1), player2_id: s(4), best_of: bestOf, scheduled_at: null, bracket_slot: 1, feeds_into_slot: 3, feeds_into_position: "player1" });
        rows.push({ tournament_id, round: "SF", player1_id: s(2), player2_id: s(3), best_of: bestOf, scheduled_at: null, bracket_slot: 2, feeds_into_slot: 3, feeds_into_position: "player2" });
        rows.push({ tournament_id, round: "Final", player1_id: null, player2_id: null, best_of: bestOf, scheduled_at: null, bracket_slot: 3, feeds_into_slot: null, feeds_into_position: null });
      } else {
        // 8: QF1=1v8, QF2=4v5, QF3=3v6, QF4=2v7
        rows.push({ tournament_id, round: "QF", player1_id: s(1), player2_id: s(8), best_of: bestOf, scheduled_at: null, bracket_slot: 1, feeds_into_slot: 5, feeds_into_position: "player1" });
        rows.push({ tournament_id, round: "QF", player1_id: s(4), player2_id: s(5), best_of: bestOf, scheduled_at: null, bracket_slot: 2, feeds_into_slot: 5, feeds_into_position: "player2" });
        rows.push({ tournament_id, round: "QF", player1_id: s(3), player2_id: s(6), best_of: bestOf, scheduled_at: null, bracket_slot: 3, feeds_into_slot: 6, feeds_into_position: "player1" });
        rows.push({ tournament_id, round: "QF", player1_id: s(2), player2_id: s(7), best_of: bestOf, scheduled_at: null, bracket_slot: 4, feeds_into_slot: 6, feeds_into_position: "player2" });
        rows.push({ tournament_id, round: "SF", player1_id: null, player2_id: null, best_of: bestOf, scheduled_at: null, bracket_slot: 5, feeds_into_slot: 7, feeds_into_position: "player1" });
        rows.push({ tournament_id, round: "SF", player1_id: null, player2_id: null, best_of: bestOf, scheduled_at: null, bracket_slot: 6, feeds_into_slot: 7, feeds_into_position: "player2" });
        rows.push({ tournament_id, round: "Final", player1_id: null, player2_id: null, best_of: bestOf, scheduled_at: null, bracket_slot: 7, feeds_into_slot: null, feeds_into_position: null });
      }

      const { error: insErr } = await supabaseTyped.from("playoff_matches").insert(rows as never);
      if (insErr) throw insErr;
      return { count: rows.length };
    },
    onSuccess: (_, { tournament_id }) => {
      queryClient.invalidateQueries({ queryKey: ["playoff_matches", tournament_id] });
    },
  });
};

export const useDeletePlayoffBracket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tournament_id }: { tournament_id: string }) => {
      // Cascade match_games first
      const { data: pm } = await supabaseTyped
        .from("playoff_matches")
        .select("id")
        .eq("tournament_id", tournament_id);
      const ids = (pm ?? []).map((m) => m.id);
      if (ids.length > 0) {
        const { error: gErr } = await supabaseTyped
          .from("match_games")
          .delete()
          .in("playoff_match_id", ids);
        if (gErr) throw gErr;
      }
      const { error } = await supabaseTyped
        .from("playoff_matches")
        .delete()
        .eq("tournament_id", tournament_id);
      if (error) throw error;
    },
    onSuccess: (_, { tournament_id }) => {
      queryClient.invalidateQueries({ queryKey: ["playoff_matches", tournament_id] });
      queryClient.invalidateQueries({ queryKey: ["match_games", "tournament-playoff", tournament_id] });
    },
  });
};

export const useReportPlayoffScore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playoffMatchId,
      games,
    }: {
      playoffMatchId: string;
      games: ReportMatchGameInput[];
      tournamentId: string;
    }) => {
      if (games.length < 1 || games.length > 5) {
        throw new Error("Must report between 1 and 5 games.");
      }
      const sorted = [...games].sort((a, b) => a.game_number - b.game_number);
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].game_number !== i + 1) {
          throw new Error("Game numbers must be contiguous starting from 1.");
        }
      }
      let score1 = 0;
      let score2 = 0;
      for (const g of sorted) {
        if (g.p1_score > g.p2_score) score1++;
        else if (g.p2_score > g.p1_score) score2++;
      }

      const { data: pm, error: pmErr } = await supabaseTyped
        .from("playoff_matches")
        .select("player1_id, player2_id, tournament_id, feeds_into_slot, feeds_into_position")
        .eq("id", playoffMatchId)
        .single();
      if (pmErr) throw pmErr;

      const winner_id =
        score1 > score2 ? pm.player1_id : score2 > score1 ? pm.player2_id : null;

      // Replace match_games for this playoff match
      const { error: delErr } = await supabaseTyped
        .from("match_games")
        .delete()
        .eq("playoff_match_id", playoffMatchId);
      if (delErr) throw delErr;
      const { error: insErr } = await supabaseTyped
        .from("match_games")
        .insert(
          sorted.map((g) => ({
            playoff_match_id: playoffMatchId,
            game_number: g.game_number,
            p1_score: g.p1_score,
            p2_score: g.p2_score,
          })) as never
        );
      if (insErr) throw insErr;

      // Update playoff match
      const { error: updErr } = await supabaseTyped
        .from("playoff_matches")
        .update({ score1, score2, winner_id } as never)
        .eq("id", playoffMatchId);
      if (updErr) throw updErr;

      // Advance winner
      if (winner_id && pm.feeds_into_slot != null && pm.feeds_into_position) {
        const update: Record<string, unknown> =
          pm.feeds_into_position === "player1"
            ? { player1_id: winner_id }
            : { player2_id: winner_id };
        const { error: advErr } = await supabaseTyped
          .from("playoff_matches")
          .update(update as never)
          .eq("tournament_id", pm.tournament_id)
          .eq("bracket_slot", pm.feeds_into_slot);
        if (advErr) throw advErr;
      }
    },
    onSuccess: (_, { tournamentId, playoffMatchId }) => {
      queryClient.invalidateQueries({ queryKey: ["playoff_matches", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["match_games", "playoff", playoffMatchId] });
      queryClient.invalidateQueries({ queryKey: ["match_games", "tournament-playoff", tournamentId] });
    },
  });
};

// ============= Casual matches =============

export const useCasualMatches = (userId: string | undefined) =>
  useQuery({
    queryKey: ["casual_matches", userId],
    enabled: !!userId,
    queryFn: async () => {
      // Look up user's profile id first
      const { data: prof, error: profErr } = await supabaseTyped
        .from("profiles")
        .select("id")
        .eq("user_id", userId!)
        .maybeSingle();
      if (profErr) throw profErr;
      if (!prof) return [] as MatchRow[];
      const profileId = (prof as { id: string }).id;

      const { data, error } = await supabaseTyped
        .from("matches")
        .select(
          "*, player1:profiles!matches_player1_id_fkey(id, display_name), player2:profiles!matches_player2_id_fkey(id, display_name)"
        )
        .eq("match_type", "casual")
        .or(`player1_id.eq.${profileId},player2_id.eq.${profileId}`)
        .order("scheduled_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as MatchRow[];
    },
  });

export const useCreateCasualMatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      player1_profile_id,
      player2_profile_id,
      scheduled_at,
      best_of,
    }: {
      player1_profile_id: string;
      player2_profile_id: string;
      scheduled_at: string | null;
      best_of: number;
    }) => {
      const { error } = await supabaseTyped.from("matches").insert({
        match_type: "casual",
        tournament_id: null,
        status: "Pending",
        round: 0,
        player1_id: player1_profile_id,
        player2_id: player2_profile_id,
        scheduled_at,
        best_of,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casual_matches"] });
    },
  });
};
