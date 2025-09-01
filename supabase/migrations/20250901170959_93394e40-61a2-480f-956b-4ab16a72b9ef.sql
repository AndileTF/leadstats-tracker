-- Create agent_performance_metrics table for tracking detailed agent performance
CREATE TABLE public.agent_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  date DATE NOT NULL,
  calls INTEGER DEFAULT 0,
  emails INTEGER DEFAULT 0,
  live_chat INTEGER DEFAULT 0,
  escalations INTEGER DEFAULT 0,
  qa_assessments INTEGER DEFAULT 0,
  survey_tickets INTEGER DEFAULT 0,
  avg_response_time INTEGER, -- in minutes
  customer_satisfaction DECIMAL(3,2), -- 1.00-5.00 scale
  tickets_resolved INTEGER DEFAULT 0,
  first_call_resolution DECIMAL(5,2), -- percentage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, date)
);

-- Enable RLS
ALTER TABLE public.agent_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Team leads and admins can access agent performance" 
ON public.agent_performance_metrics 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'team_lead'::app_role));

-- Add foreign key constraint to agents table
ALTER TABLE public.agent_performance_metrics 
ADD CONSTRAINT fk_agent_performance_agent_id 
FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_agent_performance_agent_id ON public.agent_performance_metrics(agent_id);
CREATE INDEX idx_agent_performance_date ON public.agent_performance_metrics(date);
CREATE INDEX idx_agent_performance_agent_date ON public.agent_performance_metrics(agent_id, date);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_agent_performance_updated_at
BEFORE UPDATE ON public.agent_performance_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Set replica identity for real-time updates
ALTER TABLE public.agent_performance_metrics REPLICA IDENTITY FULL;