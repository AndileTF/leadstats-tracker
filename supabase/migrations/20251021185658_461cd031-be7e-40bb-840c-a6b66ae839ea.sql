-- Add RLS policies for csr_agents table
ALTER TABLE public.csr_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view csr agents"
ON public.csr_agents
FOR SELECT
USING (true);

CREATE POLICY "Team leads and admins can manage csr agents"
ON public.csr_agents
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'team_lead'::app_role));

-- Add RLS policies for csr_daily table
ALTER TABLE public.csr_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view csr daily stats"
ON public.csr_daily
FOR SELECT
USING (true);

CREATE POLICY "Team leads and admins can manage csr daily stats"
ON public.csr_daily
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'team_lead'::app_role));