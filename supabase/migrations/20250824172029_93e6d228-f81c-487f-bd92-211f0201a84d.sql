-- Create proper role system (fixed approach)
CREATE TYPE app_role AS ENUM ('agent', 'team_lead', 'admin');

-- Create user_roles table for hierarchical permissions
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') THEN 'admin'::app_role
      WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'team_lead') THEN 'team_lead'::app_role
      ELSE 'agent'::app_role
    END;
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insert admin roles for existing users based on their current role
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT id, 'admin'::app_role, NOW()
FROM profiles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert team_lead roles for existing users
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT id, 'team_lead'::app_role, NOW()
FROM profiles
WHERE role = 'editor'
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert agent roles for other users
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT id, 'agent'::app_role, NOW()
FROM profiles
WHERE role NOT IN ('admin', 'editor')
ON CONFLICT (user_id, role) DO NOTHING;