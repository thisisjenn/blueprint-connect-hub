-- Daily Updates
CREATE TABLE public.project_daily_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  update_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  summary TEXT,
  photo_url TEXT,
  posted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_daily_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can view daily updates"
  ON public.project_daily_updates FOR SELECT
  TO authenticated
  USING (public.is_project_member(project_id));

CREATE POLICY "Contractors manage own project daily updates"
  ON public.project_daily_updates FOR ALL
  TO authenticated
  USING (public.owns_project(project_id))
  WITH CHECK (public.owns_project(project_id));

CREATE TRIGGER update_project_daily_updates_updated_at
  BEFORE UPDATE ON public.project_daily_updates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Selections / Approvals
CREATE TABLE public.project_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  option_name TEXT,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  client_notes TEXT,
  decided_at TIMESTAMPTZ,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can view selections"
  ON public.project_selections FOR SELECT
  TO authenticated
  USING (public.is_project_member(project_id));

CREATE POLICY "Contractors manage own project selections"
  ON public.project_selections FOR ALL
  TO authenticated
  USING (public.owns_project(project_id))
  WITH CHECK (public.owns_project(project_id));

CREATE POLICY "Clients can update selection decisions"
  ON public.project_selections FOR UPDATE
  TO authenticated
  USING (public.is_client_for_project(project_id))
  WITH CHECK (public.is_client_for_project(project_id));

CREATE TRIGGER update_project_selections_updated_at
  BEFORE UPDATE ON public.project_selections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pdu_project ON public.project_daily_updates(project_id, update_date DESC);
CREATE INDEX idx_psel_project ON public.project_selections(project_id, status);