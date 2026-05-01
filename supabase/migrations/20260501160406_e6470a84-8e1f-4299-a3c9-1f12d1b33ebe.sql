-- 1. Tournaments: add columns
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS best_of INTEGER NOT NULL DEFAULT 5 CHECK (best_of BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS group_count INTEGER,
  ADD COLUMN IF NOT EXISTS playoff_size INTEGER CHECK (playoff_size IS NULL OR playoff_size IN (4, 8)),
  ADD COLUMN IF NOT EXISTS rules TEXT;

-- 2. Tournament participants table
CREATE TABLE IF NOT EXISTS public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_name TEXT,
  seed INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, profile_id)
);

ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tournament participants viewable by everyone" ON public.tournament_participants;
CREATE POLICY "Tournament participants viewable by everyone"
  ON public.tournament_participants FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert tournament participants" ON public.tournament_participants;
CREATE POLICY "Admins can insert tournament participants"
  ON public.tournament_participants FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update tournament participants" ON public.tournament_participants;
CREATE POLICY "Admins can update tournament participants"
  ON public.tournament_participants FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete tournament participants" ON public.tournament_participants;
CREATE POLICY "Admins can delete tournament participants"
  ON public.tournament_participants FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Matches: alter
ALTER TABLE public.matches
  ALTER COLUMN tournament_id DROP NOT NULL;

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS match_type TEXT NOT NULL DEFAULT 'group' CHECK (match_type IN ('group', 'casual')),
  ADD COLUMN IF NOT EXISTS group_name TEXT,
  ADD COLUMN IF NOT EXISTS best_of INTEGER NOT NULL DEFAULT 5 CHECK (best_of BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES public.profiles(id);

-- Add type/tournament consistency check
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'matches_type_tournament_check'
  ) THEN
    ALTER TABLE public.matches
      ADD CONSTRAINT matches_type_tournament_check
      CHECK (
        (match_type = 'group' AND tournament_id IS NOT NULL) OR
        (match_type = 'casual' AND tournament_id IS NULL)
      );
  END IF;
END $$;

-- Update matches policies: existing UPDATE policy already covers NULL tournament_id (player checks).
-- Add casual-match insert policy for participants
DROP POLICY IF EXISTS "Participants can insert casual matches" ON public.matches;
CREATE POLICY "Participants can insert casual matches"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (
    match_type = 'casual'
    AND tournament_id IS NULL
    AND (
      player1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      OR player2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- 4. Playoff matches: add columns
ALTER TABLE public.playoff_matches
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS best_of INTEGER NOT NULL DEFAULT 5 CHECK (best_of BETWEEN 1 AND 5);

-- 5. Match games table
CREATE TABLE IF NOT EXISTS public.match_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  playoff_match_id UUID REFERENCES public.playoff_matches(id) ON DELETE CASCADE,
  game_number INTEGER NOT NULL CHECK (game_number BETWEEN 1 AND 5),
  p1_score INTEGER NOT NULL CHECK (p1_score >= 0),
  p2_score INTEGER NOT NULL CHECK (p2_score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT match_games_one_parent_check CHECK (
    (match_id IS NOT NULL AND playoff_match_id IS NULL) OR
    (match_id IS NULL AND playoff_match_id IS NOT NULL)
  ),
  UNIQUE (match_id, game_number),
  UNIQUE (playoff_match_id, game_number)
);

ALTER TABLE public.match_games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Match games viewable by everyone" ON public.match_games;
CREATE POLICY "Match games viewable by everyone"
  ON public.match_games FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Participants or admins can insert match games" ON public.match_games;
CREATE POLICY "Participants or admins can insert match games"
  ON public.match_games FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      match_id IS NOT NULL AND (
        public.has_role(auth.uid(), 'admin')
        OR EXISTS (
          SELECT 1 FROM public.matches m
          WHERE m.id = match_id
            AND (
              m.player1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
              OR m.player2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
            )
        )
      )
    )
    OR
    (
      playoff_match_id IS NOT NULL AND public.has_role(auth.uid(), 'admin')
    )
  );

DROP POLICY IF EXISTS "Participants or admins can update match games" ON public.match_games;
CREATE POLICY "Participants or admins can update match games"
  ON public.match_games FOR UPDATE
  TO authenticated
  USING (
    (
      match_id IS NOT NULL AND (
        public.has_role(auth.uid(), 'admin')
        OR EXISTS (
          SELECT 1 FROM public.matches m
          WHERE m.id = match_id
            AND (
              m.player1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
              OR m.player2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
            )
        )
      )
    )
    OR
    (
      playoff_match_id IS NOT NULL AND public.has_role(auth.uid(), 'admin')
    )
  );

DROP POLICY IF EXISTS "Admins can delete match games" ON public.match_games;
CREATE POLICY "Admins can delete match games"
  ON public.match_games FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_match_games_updated_at ON public.match_games;
CREATE TRIGGER update_match_games_updated_at
  BEFORE UPDATE ON public.match_games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();