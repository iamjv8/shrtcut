/*
  # URL Shortener Schema

  1. New Tables
    - `urls`
      - `id` (uuid, primary key)
      - `original_url` (text, not null) - The original long URL
      - `short_code` (text, unique) - The generated short code
      - `user_id` (uuid) - Reference to the auth.users table
      - `created_at` (timestamp) - When the URL was shortened
      - `visits` (integer) - Number of times the short URL was accessed

  2. Security
    - Enable RLS on `urls` table
    - Add policies for:
      - Anyone can read URLs
      - Authenticated users can create URLs
      - Users can only update/delete their own URLs
*/

CREATE TABLE IF NOT EXISTS urls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url text NOT NULL,
  short_code text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  visits integer DEFAULT 0
);

ALTER TABLE urls ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read URLs (needed for redirects)
CREATE POLICY "URLs are viewable by everyone" 
  ON urls 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to create URLs
CREATE POLICY "Authenticated users can create URLs" 
  ON urls 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own URLs
CREATE POLICY "Users can update their own URLs" 
  ON urls 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Allow users to delete their own URLs
CREATE POLICY "Users can delete their own URLs" 
  ON urls 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);