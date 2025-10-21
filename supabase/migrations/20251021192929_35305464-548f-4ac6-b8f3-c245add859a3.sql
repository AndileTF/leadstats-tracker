-- Add team_lead role for Donald
INSERT INTO public.user_roles (user_id, role)
VALUES ('bba81d53-fd33-4af2-ba9a-790b495cfda3', 'team_lead')
ON CONFLICT (user_id, role) DO NOTHING;