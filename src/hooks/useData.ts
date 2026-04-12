import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { players as mockPlayers } from "@/data/mockData";

// Types for joined data
export interface ProfileRow {
  id: string;
  user_id: string;
  display_name: string;
  elo: number;
  visible_in_ranking: boolean;
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
  challenger: { id: string; display_name: string; elo: number };
  challenged: { id: string; display_name: string; elo: number };
  winner: { id: string; display_name: string } | null;
}

export interface TournamentParticipantRow {
  id: string;
  tournament_id: string;
  profile_id: string;
  joined_at: string;
  profile: { id: string; display_name: string; elo: number };
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
    queryKey: ["tournaments"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("tournaments")
          .select("*")
          .order("active", { ascending: false })
          .order("start_date", { ascending: false });

        if (error || !data || data.length === 0) {
          // Fall back to mock data
          return [
            {
              id: "t1",
              name: "Spring 2025 League",
              description: "Current season tournament with exciting matches",
              start_date: "2025-03-01",
              end_date: "2025-06-30",
              active: true,
              signup_deadline: "2025-02-28",
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "t2",
              name: "Winter 2024 League",
              description: "Winter season tournament",
              start_date: "2024-10-01",
              end_date: "2024-12-31",
              active: false,
              created_at: "2024-09-01T00:00:00Z",
              updated_at: "2024-09-01T00:00:00Z",
            },
            {
              id: "t3",
              name: "Fall 2024 League",
              description: "Fall season tournament",
              start_date: "2024-08-01",
              end_date: "2024-09-30",
              active: false,
              created_at: "2024-07-01T00:00:00Z",
              updated_at: "2024-07-01T00:00:00Z",
            },
          ];
        }

        return data;
      } catch (err) {
        // Fall back to mock data on any error
        return [
          {
            id: "t1",
            name: "Spring 2025 League",
            description: "Current season tournament with exciting matches",
            start_date: "2025-03-01",
            end_date: "2025-06-30",
            active: true,
            signup_deadline: "2025-02-28",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
          },
          {
            id: "t2",
            name: "Winter 2024 League",
            description: "Winter season tournament",
            start_date: "2024-10-01",
            end_date: "2024-12-31",
            active: false,
            created_at: "2024-09-01T00:00:00Z",
            updated_at: "2024-09-01T00:00:00Z",
          },
          {
            id: "t3",
            name: "Fall 2024 League",
            description: "Fall season tournament",
            start_date: "2024-08-01",
            end_date: "2024-09-30",
            active: false,
            created_at: "2024-07-01T00:00:00Z",
            updated_at: "2024-07-01T00:00:00Z",
          },
        ];
      }
    },
  });

export const useProfiles = () =>
  useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, user_id, display_name, elo, visible_in_ranking")
          .order("elo", { ascending: false });

        if (error || !data || data.length === 0) {
          // Fall back to mock data
          return mockPlayers.map(player => ({
            id: player.id,
            user_id: player.id, // Mock user_id
            display_name: player.name,
            elo: player.elo,
            visible_in_ranking: true,
          })) as ProfileRow[];
        }

        return data as ProfileRow[];
      } catch (err) {
        // Fall back to mock data on any error
        return mockPlayers.map(player => ({
          id: player.id,
          user_id: player.id, // Mock user_id
          display_name: player.name,
          elo: player.elo,
          visible_in_ranking: true,
        })) as ProfileRow[];
      }
    },
  });

export const useMatches = (tournamentId: string | null) =>
  useQuery({
    queryKey: ["matches", tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*, player1:profiles!matches_player1_id_fkey(id, display_name), player2:profiles!matches_player2_id_fkey(id, display_name)")
        .eq("tournament_id", tournamentId!)
        .order("round")
        .order("created_at");
      if (error) throw error;
      return data as unknown as MatchRow[];
    },
  });

export const usePlayoffMatches = (tournamentId: string | null) =>
  useQuery({
    queryKey: ["playoff_matches", tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playoff_matches")
        .select("*, player1:profiles!playoff_matches_player1_id_fkey(id, display_name), player2:profiles!playoff_matches_player2_id_fkey(id, display_name), winner:profiles!playoff_matches_winner_id_fkey(id, display_name)")
        .eq("tournament_id", tournamentId!)
        .order("created_at");
      if (error) throw error;
      return data as unknown as PlayoffMatchRow[];
    },
  });

export const useChallengeMatches = () =>
  useQuery({
    queryKey: ["challenge_matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenge_matches")
        .select("*, challenger:profiles!challenge_matches_challenger_id_fkey(id, display_name, elo), challenged:profiles!challenge_matches_challenged_id_fkey(id, display_name, elo), winner:profiles!challenge_matches_winner_id_fkey(id, display_name)")
        .order("scheduled_at", { ascending: false });
      if (error) throw error;
      return data as unknown as ChallengeMatchRow[];
    },
  });

export const useTournamentParticipants = (tournamentId: string | null) =>
  useQuery({
    queryKey: ["tournament_participants", tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_participants")
        .select("*, profile:profiles!tournament_participants_profile_id_fkey(id, display_name, elo)")
        .eq("tournament_id", tournamentId!)
        .order("joined_at");
      if (error) throw error;
      return data as unknown as TournamentParticipantRow[];
    },
  });

export const useTournamentRules = (tournamentId: string | null) =>
  useQuery({
    queryKey: ["tournament_rules", tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_rules")
        .select("*")
        .eq("tournament_id", tournamentId!)
        .single();
      if (error) throw error;
      return data as TournamentRulesRow;
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
    }: {
      challengerId: string;
      challengedId: string;
      scheduledAt: string;
    }) => {
      const { error } = await supabase
        .from("challenge_matches")
        .insert({
          challenger_id: challengerId,
          challenged_id: challengedId,
          scheduled_at: scheduledAt,
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
      startDate,
      endDate,
    }: {
      name: string;
      startDate: string;
      endDate: string;
    }) => {
      const { data, error } = await supabase
        .from("tournaments")
        .insert({
          name,
          start_date: startDate,
          end_date: endDate,
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
