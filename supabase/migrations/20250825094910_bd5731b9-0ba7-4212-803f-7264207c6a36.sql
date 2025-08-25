-- Fix security issues: Enable RLS on all public tables
ALTER TABLE "Calls" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Emails" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Escalations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Live Chat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QA Table" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "After Call Survey Tickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_stats_duplicate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "team_leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agents" ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for all data tables (team leads and admins can access)
CREATE POLICY "Team leads and admins can access calls"
ON "Calls" FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'team_lead')
);

CREATE POLICY "Team leads and admins can access emails"
ON "Emails" FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'team_lead')
);

CREATE POLICY "Team leads and admins can access escalations"
ON "Escalations" FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'team_lead')
);

CREATE POLICY "Team leads and admins can access live chat"
ON "Live Chat" FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'team_lead')
);

CREATE POLICY "Team leads and admins can access QA Table"
ON "QA Table" FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'team_lead')
);

CREATE POLICY "Team leads and admins can access survey tickets"
ON "After Call Survey Tickets" FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'team_lead')
);

CREATE POLICY "Team leads and admins can access daily stats"
ON "daily_stats_duplicate" FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'team_lead')
);

CREATE POLICY "Team leads and admins can access team leads"
ON "team_leads" FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'team_lead')
);

CREATE POLICY "Team leads and admins can access agents"
ON "agents" FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'team_lead')
);

-- Fix function search paths
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path = public;
ALTER FUNCTION public.get_user_role(_user_id uuid) SET search_path = public;
ALTER FUNCTION public.get_profile_role(user_id uuid) SET search_path = public;
ALTER FUNCTION public.get_tables_list() SET search_path = public;
ALTER FUNCTION public.get_weekly_stats(start_date date) SET search_path = public;
ALTER FUNCTION public.team_lead_overview_insert_trigger() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;