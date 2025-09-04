-- Remove survey_tickets from daily_stats_duplicate and add walk_ins
ALTER TABLE public.daily_stats_duplicate 
DROP COLUMN IF EXISTS survey_tickets,
ADD COLUMN IF NOT EXISTS walk_ins integer DEFAULT 0;

-- Create agent_performance_metrics table if it doesn't exist  
CREATE TABLE IF NOT EXISTS public.agent_performance_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  calls integer DEFAULT 0,
  emails integer DEFAULT 0,
  live_chat integer DEFAULT 0,
  escalations integer DEFAULT 0,
  qa_assessments integer DEFAULT 0,
  walk_ins integer DEFAULT 0,
  avg_response_time numeric DEFAULT 0, -- in minutes
  customer_satisfaction numeric DEFAULT 0, -- 1-5 scale
  tickets_resolved integer DEFAULT 0,
  first_call_resolution numeric DEFAULT 0, -- percentage
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(agent_id, date)
);

-- Enable RLS on agent_performance_metrics
ALTER TABLE public.agent_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agent performance metrics
CREATE POLICY "Team leads and admins can access agent performance" 
ON public.agent_performance_metrics 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'team_lead'::app_role));

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_agent_performance_metrics_updated_at ON public.agent_performance_metrics;
CREATE TRIGGER update_agent_performance_metrics_updated_at
BEFORE UPDATE ON public.agent_performance_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get top/bottom performing agents
CREATE OR REPLACE FUNCTION public.get_agent_performance_rankings(
  team_lead_id_param uuid DEFAULT NULL,
  start_date_param date DEFAULT NULL,
  end_date_param date DEFAULT NULL,
  limit_count integer DEFAULT 5
)
RETURNS TABLE(
  agent_id uuid,
  agent_name text,
  team_lead_id uuid,
  total_calls bigint,
  total_emails bigint,
  total_live_chat bigint,
  total_escalations bigint,
  total_qa_assessments bigint,
  total_walk_ins bigint,
  avg_customer_satisfaction numeric,
  efficiency_score numeric,
  performance_rank integer
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH agent_totals AS (
    SELECT 
      apm.agent_id,
      a.name as agent_name,
      a.team_lead_id,
      COALESCE(SUM(apm.calls), 0) as total_calls,
      COALESCE(SUM(apm.emails), 0) as total_emails,
      COALESCE(SUM(apm.live_chat), 0) as total_live_chat,
      COALESCE(SUM(apm.escalations), 0) as total_escalations,
      COALESCE(SUM(apm.qa_assessments), 0) as total_qa_assessments,
      COALESCE(SUM(apm.walk_ins), 0) as total_walk_ins,
      COALESCE(AVG(apm.customer_satisfaction), 0) as avg_customer_satisfaction,
      -- Calculate efficiency score (higher calls + live_chat + emails - escalations is better)
      COALESCE(
        (SUM(apm.calls) + SUM(apm.live_chat) + SUM(apm.emails) - SUM(apm.escalations)) * 1.0 / 
        NULLIF(SUM(apm.calls) + SUM(apm.live_chat) + SUM(apm.emails), 0), 
        0
      ) as efficiency_score
    FROM public.agent_performance_metrics apm
    JOIN public.agents a ON apm.agent_id = a.id
    WHERE (team_lead_id_param IS NULL OR a.team_lead_id = team_lead_id_param)
      AND (start_date_param IS NULL OR apm.date >= start_date_param)
      AND (end_date_param IS NULL OR apm.date <= end_date_param)
    GROUP BY apm.agent_id, a.name, a.team_lead_id
  ),
  ranked_agents AS (
    SELECT *,
      ROW_NUMBER() OVER (ORDER BY efficiency_score DESC, total_calls DESC) as performance_rank
    FROM agent_totals
  )
  SELECT * FROM ranked_agents
  ORDER BY performance_rank;
END;
$$;