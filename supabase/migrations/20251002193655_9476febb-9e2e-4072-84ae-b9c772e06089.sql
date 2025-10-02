-- Enable RLS on leadstats tables
ALTER TABLE public.leadstats_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadstats_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadstats_kpi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadstats_qa_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadstats_performance_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leadstats_users
CREATE POLICY "Admins can manage all users"
ON public.leadstats_users
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own data"
ON public.leadstats_users
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Team leads can view their team members"
ON public.leadstats_users
FOR SELECT
USING (
  has_role(auth.uid(), 'team_lead'::app_role) AND
  team_id IN (
    SELECT id FROM public.leadstats_teams WHERE team_lead_id = auth.uid()
  )
);

-- RLS Policies for leadstats_teams
CREATE POLICY "Admins can manage all teams"
ON public.leadstats_teams
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team leads can view their teams"
ON public.leadstats_teams
FOR SELECT
USING (
  has_role(auth.uid(), 'team_lead'::app_role) AND
  team_lead_id = auth.uid()
);

CREATE POLICY "Authenticated users can view teams"
ON public.leadstats_teams
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- RLS Policies for leadstats_kpi_records
CREATE POLICY "Admins can manage all KPI records"
ON public.leadstats_kpi_records
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team leads can manage their team KPI records"
ON public.leadstats_kpi_records
FOR ALL
USING (
  has_role(auth.uid(), 'team_lead'::app_role) AND
  team_id IN (
    SELECT id FROM public.leadstats_teams WHERE team_lead_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own KPI records"
ON public.leadstats_kpi_records
FOR SELECT
USING (user_id = auth.uid());

-- RLS Policies for leadstats_qa_scores
CREATE POLICY "Admins can manage all QA scores"
ON public.leadstats_qa_scores
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team leads can manage their team QA scores"
ON public.leadstats_qa_scores
FOR ALL
USING (
  has_role(auth.uid(), 'team_lead'::app_role) AND
  team_id IN (
    SELECT id FROM public.leadstats_teams WHERE team_lead_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own QA scores"
ON public.leadstats_qa_scores
FOR SELECT
USING (user_id = auth.uid());

-- RLS Policies for leadstats_performance_goals
CREATE POLICY "Admins can manage all performance goals"
ON public.leadstats_performance_goals
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team leads can manage their team performance goals"
ON public.leadstats_performance_goals
FOR ALL
USING (
  has_role(auth.uid(), 'team_lead'::app_role) AND
  (team_id IN (
    SELECT id FROM public.leadstats_teams WHERE team_lead_id = auth.uid()
  ) OR user_id = auth.uid())
);

CREATE POLICY "Users can view their own performance goals"
ON public.leadstats_performance_goals
FOR SELECT
USING (user_id = auth.uid());