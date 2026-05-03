
CREATE OR REPLACE FUNCTION public.update_elo_after_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  elo_p1 INTEGER;
  elo_p2 INTEGER;
  expected_p1 NUMERIC;
  expected_p2 NUMERIC;
  actual_p1 NUMERIC;
  actual_p2 NUMERIC;
  new_elo_p1 INTEGER;
  new_elo_p2 INTEGER;
  k CONSTANT INTEGER := 32;
BEGIN
  -- Only run when status transitions to 'Completed' with a winner and two players
  IF NEW.status <> 'Completed' OR NEW.winner_id IS NULL
     OR NEW.player1_id IS NULL OR NEW.player2_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE'
     AND OLD.status = 'Completed'
     AND OLD.winner_id IS NOT DISTINCT FROM NEW.winner_id THEN
    RETURN NEW;
  END IF;

  SELECT elo INTO elo_p1 FROM public.profiles WHERE id = NEW.player1_id;
  SELECT elo INTO elo_p2 FROM public.profiles WHERE id = NEW.player2_id;

  IF elo_p1 IS NULL OR elo_p2 IS NULL THEN
    RETURN NEW;
  END IF;

  expected_p1 := 1.0 / (1.0 + power(10.0, (elo_p2 - elo_p1) / 400.0));
  expected_p2 := 1.0 - expected_p1;

  IF NEW.winner_id = NEW.player1_id THEN
    actual_p1 := 1; actual_p2 := 0;
  ELSIF NEW.winner_id = NEW.player2_id THEN
    actual_p1 := 0; actual_p2 := 1;
  ELSE
    actual_p1 := 0.5; actual_p2 := 0.5;
  END IF;

  new_elo_p1 := round(elo_p1 + k * (actual_p1 - expected_p1));
  new_elo_p2 := round(elo_p2 + k * (actual_p2 - expected_p2));

  UPDATE public.profiles SET elo = new_elo_p1 WHERE id = NEW.player1_id;
  UPDATE public.profiles SET elo = new_elo_p2 WHERE id = NEW.player2_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_elo_matches ON public.matches;
CREATE TRIGGER trg_update_elo_matches
AFTER INSERT OR UPDATE OF status, winner_id ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_elo_after_match();

DROP TRIGGER IF EXISTS trg_update_elo_playoff_matches ON public.playoff_matches;
CREATE TRIGGER trg_update_elo_playoff_matches
AFTER INSERT OR UPDATE OF winner_id ON public.playoff_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_elo_after_match();
