-- Fix critical security issues identified by the linter

-- 1. Enable RLS on profiles table (critical security issue)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Add missing function search_path to prevent security issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- 3. Update get_weekly_stats function to have proper search_path
CREATE OR REPLACE FUNCTION public.get_weekly_stats(start_date date)
RETURNS TABLE(team_lead_id uuid, total_calls integer, total_emails integer, total_live_chat integer, total_escalations integer, total_qa_assessments integer)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ds.team_lead_id,
    SUM(ds.calls)::integer as total_calls,
    SUM(ds.emails)::integer as total_emails,
    SUM(ds.live_chat)::integer as total_live_chat,
    SUM(ds.escalations)::integer as total_escalations,
    SUM(ds.qa_assessments)::integer as total_qa_assessments
  FROM daily_stats_duplicate ds
  WHERE ds.date >= start_date AND ds.date < start_date + interval '7 days'
  GROUP BY ds.team_lead_id;
END;
$$;

-- 4. Update team_lead_overview_insert_trigger function search_path
CREATE OR REPLACE FUNCTION public.team_lead_overview_insert_trigger()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    t_id uuid;
BEGIN
    -- Look up the team lead's id from team_leads using the inserted name
    SELECT id INTO t_id FROM team_leads WHERE name = NEW.name;
    IF t_id IS NULL THEN
        RAISE EXCEPTION 'Team lead "%" not found in team_leads table', NEW.name;
    END IF;
    -- Insert a new row into daily_stats_duplicate.
    INSERT INTO daily_stats_duplicate (
        team_lead_id,
        date,
        calls,
        emails,
        live_chat,
        escalations,
        qa_assessments,
        sla_percentage
    )
    VALUES (
        t_id,
        NEW.start_date,
        NEW.total_calls,
        NEW.total_emails,
        NEW.total_live_chat,
        NEW.total_escalations,
        NEW.total_qa_assessments,
        NEW.average_sla
    );
    RETURN NULL;
END;
$$;