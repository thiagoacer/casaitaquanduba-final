/*
  # Add Admin Users and Contact Form Tables

  1. New Tables
    - `contact_submissions`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, required)
      - `phone` (text, required)
      - `message` (text, required)
      - `status` (text, pending/read/archived)
      - `created_at` (timestamptz)
  
  2. Changes to existing tables
    - Add `admin_notes` column to booking_inquiries
    - Add `last_updated_at` column to booking_inquiries
  
  3. Security
    - Enable RLS on contact_submissions table
    - Add policies for public insert and authenticated read
    - Update booking_inquiries policies for admin operations
*/

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'archived')),
  created_at timestamptz DEFAULT now()
);

-- Add columns to booking_inquiries if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'booking_inquiries' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE booking_inquiries ADD COLUMN admin_notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'booking_inquiries' AND column_name = 'last_updated_at'
  ) THEN
    ALTER TABLE booking_inquiries ADD COLUMN last_updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Enable RLS on contact_submissions
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for contact_submissions
CREATE POLICY "Anyone can create contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contact submissions"
  ON contact_submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update booking_inquiries policies for full admin access
DROP POLICY IF EXISTS "Only authenticated users can view booking inquiries" ON booking_inquiries;

CREATE POLICY "Authenticated users can view booking inquiries"
  ON booking_inquiries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update booking inquiries"
  ON booking_inquiries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete booking inquiries"
  ON booking_inquiries FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_updated ON booking_inquiries(last_updated_at DESC);