CREATE POLICY "Users can delete own tournament participation"
ON public.tournament_participants
FOR DELETE
TO authenticated
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));