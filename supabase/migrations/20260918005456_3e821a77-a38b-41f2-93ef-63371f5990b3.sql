ALTER TABLE public.playlists ADD COLUMN IF NOT EXISTS is_global boolean NOT NULL DEFAULT false;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '{"live":true,"movie":true,"series":true,"kids":true}'::jsonb,
  ADD COLUMN IF NOT EXISTS max_quality text NOT NULL DEFAULT 'auto';

ALTER TABLE public.activation_codes
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '{"live":true,"movie":true,"series":true,"kids":true}'::jsonb,
  ADD COLUMN IF NOT EXISTS max_quality text NOT NULL DEFAULT 'auto';

CREATE POLICY "playlists_admin_global" ON public.playlists
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.hidden_channels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id uuid NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  item_type text NOT NULL DEFAULT 'live',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (playlist_id, item_id, item_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hidden_channels TO authenticated;
GRANT ALL ON public.hidden_channels TO service_role;

ALTER TABLE public.hidden_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hidden_channels_admin" ON public.hidden_channels
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));