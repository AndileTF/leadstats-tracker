-- Fix infinite recursion in user_roles RLS policies
-- First, drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;

-- Create simple, non-recursive policies
-- Users can view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all roles (using the security definer function to avoid recursion)
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert roles (using the security definer function)
CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update roles (using the security definer function)
CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete roles (using the security definer function)
CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'::app_role));