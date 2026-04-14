import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { players as mockPlayers, tournaments as mockTournaments, tournamentParticipants as mockTournamentParticipants, matches as mockMatches, playoffBracket as mockPlayoffBracket, challengeMatches as mockChallengeMatches, matchApprovals as mockMatchApprovals, rules as mockRules } from "@/data/mockData";

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
          .select("id, user_id, display_name, elo, visible_in_ranking")
          .order("elo", { ascending: false });

        if (error || !data || data.length === 0) {
          // Fall back to mock data
          return mockPlayers.map(player => ({
            id: player.id,
            user_id: player.id, // Mock user_id
            display_name: player.name,
            elo: player.elo,
            visible_in_ranking: player.visible_in_ranking ?? true,
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
      })) as MatchRow[];
    },
  });

export const usePlayoffMatches = (tournamentId: string | null) =>
  useQuery({
    queryKey: ["playoff_matches", tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      // Force mock data for now to bypass database
      const tournamentPlayoffs = tournamentId === "t1" ? mockPlayoffBracket : [];

      return tournamentPlayoffs.map(p => ({
        id: p.id,
        tournament_id: tournamentId!,
        round: p.round,
        player1_id: p.player1,
        player2_id: p.player2,
        score1: p.score1,
        score2: p.score2,
        winner_id: p.winner,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
        player1: p.player1 ? { id: p.player1, display_name: mockPlayers.find(pl => pl.id === p.player1)?.name || "" } : null,
        player2: p.player2 ? { id: p.player2, display_name: mockPlayers.find(pl => pl.id === p.player2)?.name || "" } : null,
        winner: p.winner ? { id: p.winner, display_name: mockPlayers.find(pl => pl.id === p.winner)?.name || "" } : null,
      })) as PlayoffMatchRow[];
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
      // Force mock data for now to bypass database
      const participants = mockTournamentParticipants.filter(tp => tp.tournament_id === tournamentId);
      return participants as TournamentParticipantRow[];
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
      description,
    }: {
      name: string;
      startDate: string;
      endDate: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from("tournaments")
        .insert({
          name,
          start_date: startDate,
          end_date: endDate,
          signup_deadline: startDate, // Sign-up available until tournament starts
          description,
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
