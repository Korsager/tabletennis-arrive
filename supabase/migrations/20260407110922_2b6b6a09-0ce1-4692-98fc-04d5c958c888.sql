
-- Create role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Fix tournament policies: only admins can insert/update
DROP POLICY "Authenticated users can insert tournaments" ON public.tournaments;
DROP POLICY "Authenticated users can update tournaments" ON public.tournaments;
CREATE POLICY "Admins can insert tournaments" ON public.tournaments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update tournaments" ON public.tournaments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix match policies: participants or admins can update
DROP POLICY "Authenticated users can insert matches" ON public.matches;
DROP POLICY "Authenticated users can update matches" ON public.matches;
CREATE POLICY "Admins can insert matches" ON public.matches FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Participants or admins can update matches" ON public.matches FOR UPDATE TO authenticated USING (
  player1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR player2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Fix playoff match policies
DROP POLICY "Authenticated users can insert playoff matches" ON public.playoff_matches;
DROP POLICY "Authenticated users can update playoff matches" ON public.playoff_matches;
CREATE POLICY "Admins can insert playoff matches" ON public.playoff_matches FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update playoff matches" ON public.playoff_matches FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
