/*
  # Update URL and user role policies

  1. Changes
    - Update URLs policies with proper admin checks
    - Update user_roles policies for better security
  
  2. Security
    - Maintain RLS for both tables
    - Ensure proper access control for admins and users
    - Fix policy conflicts
*/

-- Safely handle user_roles policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'Users can read their own role'
  ) THEN
    DROP POLICY "Users can read their own role" ON user_roles;
  END IF;
END $$;

-- Create new user_roles policy
CREATE POLICY "Users can read their own role"
ON user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Safely handle URLs policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'urls' 
    AND policyname = 'Users can view their own URLs'
  ) THEN
    DROP POLICY "Users can view their own URLs" ON urls;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'urls' 
    AND policyname = 'Users can update their own URLs'
  ) THEN
    DROP POLICY "Users can update their own URLs" ON urls;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'urls' 
    AND policyname = 'Users can delete their own URLs'
  ) THEN
    DROP POLICY "Users can delete their own URLs" ON urls;
  END IF;
END $$;

-- Create new URLs policies with safe admin checks
CREATE POLICY "Users can view their own URLs"
ON urls
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Users can update their own URLs"
ON urls
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Users can delete their own URLs"
ON urls
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);