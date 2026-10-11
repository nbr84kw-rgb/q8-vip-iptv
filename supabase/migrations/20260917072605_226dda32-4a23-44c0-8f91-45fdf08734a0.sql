CREATE TABLE public.activation_codes (id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, code TEXT NOT NULL UNIQUE, plan TEXT NOT NULL DEFAULT 'vip', duration_days INT NOT NULL DEFAULT 30, max_devices INT NOT NULL DEFAULT 1, used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, used_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT, INSERT, DELETE ON public.activation_codes TO authenticated;
GRANT ALL ON public.activation_codes TO service_role;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view codes" ON public.activation_codes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create codes" ON public.activation_codes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete codes" ON public.activation_codes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));