ALTER TABLE public.playoff_matches
  ADD COLUMN IF NOT EXISTS bracket_slot INTEGER,
  ADD COLUMN IF NOT EXISTS feeds_into_slot INTEGER,
  ADD COLUMN IF NOT EXISTS feeds_into_position TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'playoff_matches_feeds_into_position_check'
  ) THEN
    ALTER TABLE public.playoff_matches
      ADD CONSTRAINT playoff_matches_feeds_into_position_check
      CHECK (feeds_into_position IS NULL OR feeds_into_position IN ('player1', 'player2'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_playoff_matches_tournament_slot
  ON public.playoff_matches (tournament_id, bracket_slot);