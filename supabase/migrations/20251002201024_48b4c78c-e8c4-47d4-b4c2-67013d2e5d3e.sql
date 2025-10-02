-- Fix RLS policies to prevent infinite recursion and improve security

-- First, drop existing problematic policies on user_roles to recreate them properly
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Drop the is_admin function if it exists (likely causing recursion)
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Recreate RLS policies for user_roles using has_role function
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Strengthen RLS policies for sensitive PII tables
-- Update daily_stats to restrict access
DROP POLICY IF EXISTS "Authenticated users can view daily stats" ON public.daily_stats;
CREATE POLICY "Admins and team leads can view daily stats"
ON public.daily_stats
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'team_lead'));

-- Update profile table policies
DROP POLICY IF EXISTS "Users can view their own profile data" ON public.profile;
DROP POLICY IF EXISTS "Team leads and admins can manage profiles" ON public.profile;

CREATE POLICY "Users can view their own profile"
ON public.profile
FOR SELECT
TO authenticated
USING (agentid = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'team_lead'));

CREATE POLICY "Admins and team leads can manage profiles"
ON public.profile
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'team_lead'));

-- Update csr_agent_proflie policies
DROP POLICY IF EXISTS "Authenticated users can view agent profiles" ON public.csr_agent_proflie;
DROP POLICY IF EXISTS "Team leads and admins can manage agent profiles" ON public.csr_agent_proflie;

CREATE POLICY "Users can view their own agent profile"
ON public.csr_agent_proflie
FOR SELECT
TO authenticated
USING (agentid = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'team_lead'));

CREATE POLICY "Admins and team leads can manage agent profiles"
ON public.csr_agent_proflie
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'team_lead'));

-- Remove role column from profiles table since roles should only be in user_roles
-- Note: This is commented out to prevent data loss. Run manually if desired.
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;