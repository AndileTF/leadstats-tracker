-- Sync existing profile roles to user_roles table
-- This ensures all existing users have proper role assignments

INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
SELECT 
  p.id as user_id,
  CASE 
    WHEN p.role = 'admin' THEN 'admin'::app_role
    WHEN p.role = 'team_lead' THEN 'team_lead'::app_role  
    ELSE 'agent'::app_role
  END as role,
  p.id as assigned_by, -- Self-assigned for existing users
  now() as assigned_at
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.id
);