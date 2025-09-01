-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles table
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Set replica identity for real-time updates
ALTER TABLE public."Calls" REPLICA IDENTITY FULL;
ALTER TABLE public."Emails" REPLICA IDENTITY FULL;
ALTER TABLE public."Live Chat" REPLICA IDENTITY FULL;
ALTER TABLE public."Escalations" REPLICA IDENTITY FULL;
ALTER TABLE public."QA Table" REPLICA IDENTITY FULL;
ALTER TABLE public."After Call Survey Tickets" REPLICA IDENTITY FULL;
ALTER TABLE public.daily_stats_duplicate REPLICA IDENTITY FULL;
ALTER TABLE public.agents REPLICA IDENTITY FULL;
ALTER TABLE public.team_leads REPLICA IDENTITY FULL;