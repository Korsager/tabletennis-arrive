
CREATE OR REPLACE FUNCTION public.seed_mock_data()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tournament_id uuid;
  v_profile_ids uuid[] := ARRAY[]::uuid[];
  v_pid uuid;
  v_names text[] := ARRAY['Test Alex','Test Sarah','Test Marcus','Test Emily','Test Jake','Test Priya','Test Tom','Test Nina'];
  v_elos int[] := ARRAY[1580,1520,1480,1450,1420,1390,1360,1330];
  i int;
  j int;
  v_p1 uuid;
  v_p2 uuid;
  v_round int;
  v_status text;
  v_s1 int;
  v_s2 int;
  v_winner uuid;
  v_qf1 uuid;
  v_qf2 uuid;
  v_sf1 uuid;
  v_sf2 uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can seed mock data';
  END IF;

  -- Create 8 test profiles with synthetic user_ids
  FOR i IN 1..8 LOOP
    INSERT INTO public.profiles (user_id, display_name, elo)
    VALUES (gen_random_uuid(), v_names[i] || ' ' || floor(extract(epoch from now()))::text, v_elos[i])
    RETURNING id INTO v_pid;
    v_profile_ids := array_append(v_profile_ids, v_pid);
  END LOOP;

  -- Create tournament
  INSERT INTO public.tournaments (name, start_date, end_date, active, best_of, group_count, playoff_size, rules)
  VALUES (
    'Mock Test Tournament ' || to_char(now(), 'YYYY-MM-DD HH24:MI'),
    current_date,
    current_date + interval '30 days',
    false,
    5,
    1,
    4,
    'Auto-generated mock tournament for testing.'
  )
  RETURNING id INTO v_tournament_id;

  -- Add all 8 as participants
  FOR i IN 1..8 LOOP
    INSERT INTO public.tournament_participants (tournament_id, profile_id, group_name, seed)
    VALUES (v_tournament_id, v_profile_ids[i], 'A', i);
  END LOOP;

  -- Generate round-robin matches
  v_round := 1;
  FOR i IN 1..7 LOOP
    FOR j IN (i+1)..8 LOOP
      v_p1 := v_profile_ids[i];
      v_p2 := v_profile_ids[j];

      -- Roughly 60% completed
      IF random() < 0.6 THEN
        v_status := 'Completed';
        IF random() < 0.5 THEN
          v_s1 := 3; v_s2 := floor(random()*3)::int; v_winner := v_p1;
        ELSE
          v_s1 := floor(random()*3)::int; v_s2 := 3; v_winner := v_p2;
        END IF;
      ELSE
        v_status := 'Pending';
        v_s1 := NULL; v_s2 := NULL; v_winner := NULL;
      END IF;

      INSERT INTO public.matches (tournament_id, round, player1_id, player2_id, score1, score2, status, winner_id, match_type, group_name, best_of)
      VALUES (v_tournament_id, v_round, v_p1, v_p2, v_s1, v_s2, v_status, v_winner, 'group', 'A', 5);
    END LOOP;
    v_round := v_round + 1;
  END LOOP;

  -- Playoff bracket: 2 QF, 2 SF, 1 Final
  INSERT INTO public.playoff_matches (tournament_id, round, player1_id, player2_id, best_of, bracket_slot)
  VALUES (v_tournament_id, 'QF', v_profile_ids[3], v_profile_ids[6], 5, 1)
  RETURNING id INTO v_qf1;

  INSERT INTO public.playoff_matches (tournament_id, round, player1_id, player2_id, best_of, bracket_slot)
  VALUES (v_tournament_id, 'QF', v_profile_ids[4], v_profile_ids[5], 5, 2)
  RETURNING id INTO v_qf2;

  INSERT INTO public.playoff_matches (tournament_id, round, player1_id, best_of, bracket_slot)
  VALUES (v_tournament_id, 'SF', v_profile_ids[1], 5, 3)
  RETURNING id INTO v_sf1;

  INSERT INTO public.playoff_matches (tournament_id, round, player1_id, best_of, bracket_slot)
  VALUES (v_tournament_id, 'SF', v_profile_ids[2], 5, 4)
  RETURNING id INTO v_sf2;

  INSERT INTO public.playoff_matches (tournament_id, round, best_of, bracket_slot)
  VALUES (v_tournament_id, 'Final', 5, 5);

  RETURN v_tournament_id;
END;
$$;

REVOKE ALL ON FUNCTION public.seed_mock_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_mock_data() TO authenticated;
