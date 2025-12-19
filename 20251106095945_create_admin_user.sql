/*
  # Create Admin User
  
  1. Purpose
    - Creates the initial admin user for the system
    - Email: thiagonacena@gmail.com
    - Password: Ilhabela@2025
  
  2. Security
    - User is created with email confirmation bypassed for admin access
    - Password is securely hashed by Supabase Auth
*/

-- Create admin user using Supabase Auth
-- Note: This uses the auth.users table which is managed by Supabase
-- The password will be hashed automatically
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'thiagonacena@gmail.com',
  crypt('Ilhabela@2025', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'thiagonacena@gmail.com'
);
