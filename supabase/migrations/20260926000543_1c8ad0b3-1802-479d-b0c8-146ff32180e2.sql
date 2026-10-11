DELETE FROM public.user_roles WHERE role = 'admin' AND user_id <> '10b5b893-84ad-4f32-a161-15a8788efe7f';
DROP POLICY IF EXISTS playlists_own ON public.playlists;
DROP POLICY IF EXISTS playlists_read_own ON public.playlists;
CREATE POLICY playlists_read_own ON public.playlists FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE UNIQUE INDEX IF NOT EXISTS one_admin_only ON public.user_roles ((role)) WHERE role = 'admin';