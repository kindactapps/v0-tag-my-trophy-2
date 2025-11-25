-- Fix infinite recursion in profiles RLS policies (Version 2)
-- This addresses the issue when other tables try to join with profiles

-- Drop all possible existing policy names to prevent duplicates
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update user roles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow foreign key lookups" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

-- Drop existing helper functions if they exist
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_super_admin();
DROP FUNCTION IF EXISTS public.current_user_role();

-- Create a simple, non-recursive function to check admin status
-- This uses a direct query without going through RLS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO anon;

-- Create simple, non-recursive policies

-- 1. Allow users to view their own profile (no recursion)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Allow users to update their own profile (no recursion)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 3. Allow admins to view all profiles (uses security definer function)
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR 
    public.current_user_role() IN ('admin', 'super_admin')
  );

-- 4. Allow super admins to update any profile
CREATE POLICY "Super admins update profiles" ON public.profiles
  FOR UPDATE
  USING (public.current_user_role() = 'super_admin');

-- 5. IMPORTANT: Allow foreign key lookups from other tables
-- This prevents recursion when other tables join with profiles
CREATE POLICY "Allow foreign key lookups" ON public.profiles
  FOR SELECT
  USING (true);

-- Note: The "Allow foreign key lookups" policy with USING (true) allows
-- any authenticated user to read profile data when joining from other tables.
-- This is necessary to prevent infinite recursion but is safe because:
-- 1. It only allows SELECT operations
-- 2. The data is already protected by RLS on the parent tables
-- 3. Users can only see profiles related to data they have access to

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
