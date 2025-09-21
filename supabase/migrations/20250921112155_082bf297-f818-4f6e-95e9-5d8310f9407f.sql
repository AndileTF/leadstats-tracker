-- Fix infinite recursion in user_roles RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;

-- Create new, non-recursive policies for user_roles
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create comprehensive leadstats-tracker system tables
-- Users table for agents, team leads, supervisors, managers
CREATE TABLE IF NOT EXISTS public.leadstats_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  full_name text,
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'team_lead', 'supervisor', 'manager', 'admin')),
  team_id uuid,
  supervisor_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Teams table for team assignments and hierarchy
CREATE TABLE IF NOT EXISTS public.leadstats_teams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  team_lead_id uuid,
  supervisor_id uuid,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- KPI Records table for daily/hourly tracking of all metrics
CREATE TABLE IF NOT EXISTS public.leadstats_kpi_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  team_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  hour_of_day integer CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
  calls integer DEFAULT 0,
  live_chat integer DEFAULT 0,
  support_dns_emails integer DEFAULT 0,
  social_tickets integer DEFAULT 0,
  billing_tickets integer DEFAULT 0,
  sales_tickets integer DEFAULT 0,
  walk_ins integer DEFAULT 0,
  total_issues integer GENERATED ALWAYS AS (
    calls + live_chat + support_dns_emails + social_tickets + billing_tickets + sales_tickets + walk_ins
  ) STORED,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, hour_of_day)
);

-- QA Scores table for quality assurance scores
CREATE TABLE IF NOT EXISTS public.leadstats_qa_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  team_id uuid NOT NULL,
  assessor_id uuid,
  date date NOT NULL DEFAULT CURRENT_DATE,
  score numeric(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  category text, -- call_quality, email_quality, customer_service, etc.
  comments text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Performance Goals table
CREATE TABLE IF NOT EXISTS public.leadstats_performance_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid,
  user_id uuid,
  metric_type text NOT NULL CHECK (metric_type IN ('calls', 'live_chat', 'support_dns_emails', 'social_tickets', 'billing_tickets', 'sales_tickets', 'walk_ins', 'qa_score')),
  target_value numeric NOT NULL,
  period_type text NOT NULL DEFAULT 'daily' CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly')),
  start_date date NOT NULL,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.leadstats_users 
ADD CONSTRAINT fk_leadstats_users_team 
FOREIGN KEY (team_id) REFERENCES public.leadstats_teams(id);

ALTER TABLE public.leadstats_users 
ADD CONSTRAINT fk_leadstats_users_supervisor 
FOREIGN KEY (supervisor_id) REFERENCES public.leadstats_users(id);

ALTER TABLE public.leadstats_teams 
ADD CONSTRAINT fk_leadstats_teams_team_lead 
FOREIGN KEY (team_lead_id) REFERENCES public.leadstats_users(id);

ALTER TABLE public.leadstats_teams 
ADD CONSTRAINT fk_leadstats_teams_supervisor 
FOREIGN KEY (supervisor_id) REFERENCES public.leadstats_users(id);

ALTER TABLE public.leadstats_kpi_records 
ADD CONSTRAINT fk_leadstats_kpi_records_user 
FOREIGN KEY (user_id) REFERENCES public.leadstats_users(id);

ALTER TABLE public.leadstats_kpi_records 
ADD CONSTRAINT fk_leadstats_kpi_records_team 
FOREIGN KEY (team_id) REFERENCES public.leadstats_teams(id);

ALTER TABLE public.leadstats_qa_scores 
ADD CONSTRAINT fk_leadstats_qa_scores_user 
FOREIGN KEY (user_id) REFERENCES public.leadstats_users(id);

ALTER TABLE public.leadstats_qa_scores 
ADD CONSTRAINT fk_leadstats_qa_scores_team 
FOREIGN KEY (team_id) REFERENCES public.leadstats_teams(id);

ALTER TABLE public.leadstats_qa_scores 
ADD CONSTRAINT fk_leadstats_qa_scores_assessor 
FOREIGN KEY (assessor_id) REFERENCES public.leadstats_users(id);

ALTER TABLE public.leadstats_performance_goals 
ADD CONSTRAINT fk_leadstats_performance_goals_team 
FOREIGN KEY (team_id) REFERENCES public.leadstats_teams(id);

ALTER TABLE public.leadstats_performance_goals 
ADD CONSTRAINT fk_leadstats_performance_goals_user 
FOREIGN KEY (user_id) REFERENCES public.leadstats_users(id);

-- Enable RLS on all tables
ALTER TABLE public.leadstats_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadstats_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadstats_kpi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadstats_qa_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadstats_performance_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leadstats_users
CREATE POLICY "Admins can manage all users"
ON public.leadstats_users
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own profile"
ON public.leadstats_users
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Team leads can view their team members"
ON public.leadstats_users
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'team_lead'::app_role) AND 
  team_id IN (SELECT id FROM public.leadstats_teams WHERE team_lead_id = auth.uid())
);

CREATE POLICY "Supervisors and managers can view all users"
ON public.leadstats_users
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'supervisor'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- RLS Policies for leadstats_teams
CREATE POLICY "Admins and managers can manage teams"
ON public.leadstats_teams
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "All authenticated users can view teams"
ON public.leadstats_teams
FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for leadstats_kpi_records
CREATE POLICY "Admins can manage all KPI records"
ON public.leadstats_kpi_records
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view and update their own KPI records"
ON public.leadstats_kpi_records
FOR ALL
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Team leads can view their team KPI records"
ON public.leadstats_kpi_records
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'team_lead'::app_role) AND 
  team_id IN (SELECT id FROM public.leadstats_teams WHERE team_lead_id = auth.uid())
);

CREATE POLICY "Supervisors and managers can view all KPI records"
ON public.leadstats_kpi_records
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'supervisor'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- RLS Policies for leadstats_qa_scores
CREATE POLICY "Admins can manage all QA scores"
ON public.leadstats_qa_scores
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own QA scores"
ON public.leadstats_qa_scores
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Team leads can view their team QA scores"
ON public.leadstats_qa_scores
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'team_lead'::app_role) AND 
  team_id IN (SELECT id FROM public.leadstats_teams WHERE team_lead_id = auth.uid())
);

CREATE POLICY "Supervisors and managers can view and manage QA scores"
ON public.leadstats_qa_scores
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'supervisor'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- RLS Policies for leadstats_performance_goals
CREATE POLICY "Admins and managers can manage performance goals"
ON public.leadstats_performance_goals
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Team leads can view their team goals"
ON public.leadstats_performance_goals
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'team_lead'::app_role) AND 
  (team_id IN (SELECT id FROM public.leadstats_teams WHERE team_lead_id = auth.uid()) OR user_id = auth.uid())
);

CREATE POLICY "Users can view their own goals"
ON public.leadstats_performance_goals
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leadstats_users_updated_at
BEFORE UPDATE ON public.leadstats_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leadstats_teams_updated_at
BEFORE UPDATE ON public.leadstats_teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leadstats_kpi_records_updated_at
BEFORE UPDATE ON public.leadstats_kpi_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leadstats_qa_scores_updated_at
BEFORE UPDATE ON public.leadstats_qa_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_leadstats_users_team_id ON public.leadstats_users(team_id);
CREATE INDEX idx_leadstats_users_role ON public.leadstats_users(role);
CREATE INDEX idx_leadstats_kpi_records_user_date ON public.leadstats_kpi_records(user_id, date);
CREATE INDEX idx_leadstats_kpi_records_team_date ON public.leadstats_kpi_records(team_id, date);
CREATE INDEX idx_leadstats_qa_scores_user_date ON public.leadstats_qa_scores(user_id, date);
CREATE INDEX idx_leadstats_qa_scores_team_date ON public.leadstats_qa_scores(team_id, date);

-- Create database functions for analytics
CREATE OR REPLACE FUNCTION public.get_team_performance_summary(
  team_id_param uuid DEFAULT NULL,
  start_date_param date DEFAULT NULL,
  end_date_param date DEFAULT NULL
)
RETURNS TABLE(
  team_id uuid,
  team_name text,
  total_agents bigint,
  total_calls bigint,
  total_live_chat bigint,
  total_support_dns_emails bigint,
  total_social_tickets bigint,
  total_billing_tickets bigint,
  total_sales_tickets bigint,
  total_walk_ins bigint,
  total_issues bigint,
  avg_qa_score numeric
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as team_id,
    t.name as team_name,
    COUNT(DISTINCT u.id) as total_agents,
    COALESCE(SUM(k.calls), 0) as total_calls,
    COALESCE(SUM(k.live_chat), 0) as total_live_chat,
    COALESCE(SUM(k.support_dns_emails), 0) as total_support_dns_emails,
    COALESCE(SUM(k.social_tickets), 0) as total_social_tickets,
    COALESCE(SUM(k.billing_tickets), 0) as total_billing_tickets,
    COALESCE(SUM(k.sales_tickets), 0) as total_sales_tickets,
    COALESCE(SUM(k.walk_ins), 0) as total_walk_ins,
    COALESCE(SUM(k.total_issues), 0) as total_issues,
    COALESCE(AVG(q.score), 0) as avg_qa_score
  FROM public.leadstats_teams t
  LEFT JOIN public.leadstats_users u ON t.id = u.team_id AND u.role = 'agent'
  LEFT JOIN public.leadstats_kpi_records k ON u.id = k.user_id
    AND (start_date_param IS NULL OR k.date >= start_date_param)
    AND (end_date_param IS NULL OR k.date <= end_date_param)
  LEFT JOIN public.leadstats_qa_scores q ON u.id = q.user_id
    AND (start_date_param IS NULL OR q.date >= start_date_param)
    AND (end_date_param IS NULL OR q.date <= end_date_param)
  WHERE (team_id_param IS NULL OR t.id = team_id_param)
    AND t.is_active = true
  GROUP BY t.id, t.name
  ORDER BY total_issues DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_agent_performance_rankings(
  team_id_param uuid DEFAULT NULL,
  start_date_param date DEFAULT NULL,
  end_date_param date DEFAULT NULL,
  limit_count integer DEFAULT 10
)
RETURNS TABLE(
  user_id uuid,
  user_name text,
  team_name text,
  total_calls bigint,
  total_live_chat bigint,
  total_support_dns_emails bigint,
  total_social_tickets bigint,
  total_billing_tickets bigint,
  total_sales_tickets bigint,
  total_walk_ins bigint,
  total_issues bigint,
  avg_qa_score numeric,
  performance_rank bigint
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH agent_performance AS (
    SELECT 
      u.id as user_id,
      u.full_name as user_name,
      t.name as team_name,
      COALESCE(SUM(k.calls), 0) as total_calls,
      COALESCE(SUM(k.live_chat), 0) as total_live_chat,
      COALESCE(SUM(k.support_dns_emails), 0) as total_support_dns_emails,
      COALESCE(SUM(k.social_tickets), 0) as total_social_tickets,
      COALESCE(SUM(k.billing_tickets), 0) as total_billing_tickets,
      COALESCE(SUM(k.sales_tickets), 0) as total_sales_tickets,
      COALESCE(SUM(k.walk_ins), 0) as total_walk_ins,
      COALESCE(SUM(k.total_issues), 0) as total_issues,
      COALESCE(AVG(q.score), 0) as avg_qa_score
    FROM public.leadstats_users u
    LEFT JOIN public.leadstats_teams t ON u.team_id = t.id
    LEFT JOIN public.leadstats_kpi_records k ON u.id = k.user_id
      AND (start_date_param IS NULL OR k.date >= start_date_param)
      AND (end_date_param IS NULL OR k.date <= end_date_param)
    LEFT JOIN public.leadstats_qa_scores q ON u.id = q.user_id
      AND (start_date_param IS NULL OR q.date >= start_date_param)
      AND (end_date_param IS NULL OR q.date <= end_date_param)
    WHERE u.role = 'agent' 
      AND u.is_active = true
      AND (team_id_param IS NULL OR u.team_id = team_id_param)
    GROUP BY u.id, u.full_name, t.name
  )
  SELECT 
    ap.*,
    ROW_NUMBER() OVER (ORDER BY ap.total_issues DESC, ap.avg_qa_score DESC) as performance_rank
  FROM agent_performance ap
  ORDER BY performance_rank
  LIMIT limit_count;
END;
$$;