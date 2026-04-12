-- Expand schema for full table tennis tournament system

-- Add visibility setting to profiles
ALTER TABLE public.profiles ADD COLUMN visible_in_ranking BOOLEAN NOT NULL DEFAULT true;

-- Tournament participants
CREATE TABLE public.tournament_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, profile_id)
);
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view tournament participants" ON public.tournament_participants FOR SELECT USING (true);
CREATE POLICY "Users can join tournaments" ON public.tournament_participants FOR INSERT TO authenticated WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage participants" ON public.tournament_participants FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Tournament rules
CREATE TABLE public.tournament_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  group_stage_games INTEGER NOT NULL DEFAULT 3, -- BO3, BO5, etc.
  playoff_games INTEGER NOT NULL DEFAULT 5, -- BO5 for playoffs
  win_points INTEGER NOT NULL DEFAULT 3,
  draw_points INTEGER NOT NULL DEFAULT 1,
  loss_points INTEGER NOT NULL DEFAULT 0,
  forfeit_points INTEGER NOT NULL DEFAULT -1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id)
);
ALTER TABLE public.tournament_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view tournament rules" ON public.tournament_rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage tournament rules" ON public.tournament_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_tournament_rules_updated_at BEFORE UPDATE ON public.tournament_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Individual games within matches
CREATE TABLE public.match_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  game_number INTEGER NOT NULL,
  player1_score INTEGER NOT NULL DEFAULT 0,
  player2_score INTEGER NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, game_number)
);
ALTER TABLE public.match_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view match games" ON public.match_games FOR SELECT USING (true);
CREATE POLICY "Participants or admins can update match games" ON public.match_games FOR ALL TO authenticated USING (
  match_id IN (
    SELECT m.id FROM public.matches m
    WHERE m.player1_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
    OR m.player2_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
  ) OR public.has_role(auth.uid(), 'admin')
);
CREATE TRIGGER update_match_games_updated_at BEFORE UPDATE ON public.match_games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Match score approvals
CREATE TABLE public.match_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  approved BOOLEAN NOT NULL,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, profile_id)
);
ALTER TABLE public.match_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view match approvals" ON public.match_approvals FOR SELECT USING (true);
CREATE POLICY "Participants can approve their matches" ON public.match_approvals FOR ALL TO authenticated USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Challenge matches (non-tournament)
CREATE TABLE public.challenge_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenged_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
  score1 INTEGER,
  score2 INTEGER,
  winner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (challenger_id != challenged_id)
);
ALTER TABLE public.challenge_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view challenge matches" ON public.challenge_matches FOR SELECT USING (true);
CREATE POLICY "Users can create challenges" ON public.challenge_matches FOR INSERT TO authenticated WITH CHECK (challenger_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Participants can update challenge matches" ON public.challenge_matches FOR UPDATE TO authenticated USING (
  challenger_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR challenged_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE TRIGGER update_challenge_matches_updated_at BEFORE UPDATE ON public.challenge_matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Challenge match games
CREATE TABLE public.challenge_match_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_match_id UUID NOT NULL REFERENCES public.challenge_matches(id) ON DELETE CASCADE,
  game_number INTEGER NOT NULL,
  player1_score INTEGER NOT NULL DEFAULT 0,
  player2_score INTEGER NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_match_id, game_number)
);
ALTER TABLE public.challenge_match_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view challenge match games" ON public.challenge_match_games FOR SELECT USING (true);
CREATE POLICY "Participants can update challenge match games" ON public.challenge_match_games FOR ALL TO authenticated USING (
  challenge_match_id IN (
    SELECT cm.id FROM public.challenge_matches cm
    WHERE cm.challenger_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
    OR cm.challenged_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
  ) OR public.has_role(auth.uid(), 'admin')
);
CREATE TRIGGER update_challenge_match_games_updated_at BEFORE UPDATE ON public.challenge_match_games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Challenge approvals
CREATE TABLE public.challenge_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_match_id UUID NOT NULL REFERENCES public.challenge_matches(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  approved BOOLEAN NOT NULL,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_match_id, profile_id)
);
ALTER TABLE public.challenge_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view challenge approvals" ON public.challenge_approvals FOR SELECT USING (true);
CREATE POLICY "Participants can approve challenge matches" ON public.challenge_approvals FOR ALL TO authenticated USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Update matches table to include scheduled time
ALTER TABLE public.matches ADD COLUMN scheduled_at TIMESTAMPTZ;

-- Update playoff_matches table to include scheduled time
ALTER TABLE public.playoff_matches ADD COLUMN scheduled_at TIMESTAMPTZ;

-- Insert default rules for existing tournaments
INSERT INTO public.tournament_rules (tournament_id, group_stage_games, playoff_games, win_points, draw_points, loss_points, forfeit_points)
SELECT id, 3, 5, 3, 1, 0, -1 FROM public.tournaments;