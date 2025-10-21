-- Add team_lead_id column to profiles table to properly link users to their team lead records
ALTER TABLE public.profiles
ADD COLUMN team_lead_id uuid REFERENCES public.team_leads(id);

-- Add index for better performance
CREATE INDEX idx_profiles_team_lead_id ON public.profiles(team_lead_id);

-- Update Donald's profile with his team lead ID
UPDATE public.profiles
SET team_lead_id = '0fc3df87-b617-4ded-84bf-d2bacf84b3d0'
WHERE email = 'donald@liquid.tech';