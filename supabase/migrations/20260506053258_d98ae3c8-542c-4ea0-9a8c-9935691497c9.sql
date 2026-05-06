ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS visible_in_ranking boolean NOT NULL DEFAULT true;