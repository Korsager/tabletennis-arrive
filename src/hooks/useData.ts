import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types for joined data
export interface ProfileRow {
  id: string;
  user_id: string;
  display_name: string;
  elo: number;
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
  player1: { id: string; display_name: string } | null;
  player2: { id: string; display_name: string } | null;
  winner: { id: string; display_name: string } | null;
}

export const useTournaments = () =>
  useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("active", { ascending: false })
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useProfiles = () =>
  useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, display_name, elo")
        .order("elo", { ascending: false });
      if (error) throw error;
      return data as ProfileRow[];
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
  profiles: ProfileRow[]
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
        s1.points -= 1;
        s2.wins++;
        s2.points += 3;
      } else {
        s2.forfeits++;
        s2.points -= 1;
        s1.wins++;
        s1.points += 3;
      }
    } else if ((m.score1 ?? 0) > (m.score2 ?? 0)) {
      s1.wins++;
      s1.points += 3;
      s2.losses++;
    } else if ((m.score1 ?? 0) < (m.score2 ?? 0)) {
      s2.wins++;
      s2.points += 3;
      s1.losses++;
    } else {
      s1.draws++;
      s2.draws++;
      s1.points += 1;
      s2.points += 1;
    }
  }

  return Array.from(map.values())
    .filter((s) => s.played > 0)
    .sort((a, b) => b.points - a.points || (b.gamesWon - b.gamesLost) - (a.gamesWon - a.gamesLost));
}
