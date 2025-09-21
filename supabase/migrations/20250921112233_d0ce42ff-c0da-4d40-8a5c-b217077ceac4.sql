-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

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
  category text,
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

-- Enable RLS on all tables
ALTER TABLE public.leadstats_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadstats_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadstats_kpi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadstats_qa_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadstats_performance_goals ENABLE ROW LEVEL SECURITY;