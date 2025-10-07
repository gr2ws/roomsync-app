-- Access Policies
-- Renters: Can view and edit their own user profile.
-- Owners: Can view and edit their own user profile.
-- Admins: Can view, edit, and manage all user profiles.
--
CREATE TYPE user_type AS ENUM ('renter', 'owner', 'admin');

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  auth_id UUID UNIQUE REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL UNIQUE,
  user_type user_type NOT NULL,
  profile_picture TEXT,
  birth_date DATE,
  rented_property_id INT REFERENCES properties(property_id),
  price_range TEXT,
  room_preference TEXT,
  occupation TEXT,
  place_of_work_study TEXT
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- Updated
GRANT SELECT ON TABLE auth.users TO authenticated;
GRANT INSERT ON TABLE users TO authenticated;

-- Allow authenticated users to insert their own user row
CREATE POLICY "users_insert_own"
ON users
FOR INSERT
TO public
WITH CHECK ((auth.uid())::text = auth_id::text);

-- Below are outdated

-- Renters can view and update their own profile
CREATE POLICY "Renters can view their own profile"
ON users
FOR SELECT
USING (
  auth.uid() = auth_id AND user_type = 'renter'
);

CREATE POLICY "Renters can update their own profile"
ON users
FOR UPDATE
USING (
  auth.uid() = auth_id AND user_type = 'renter'
);

-- Owners can view and update their own profile
CREATE POLICY "Owners can view their own profile"
ON users
FOR SELECT
USING (
  auth.uid() = auth_id AND user_type = 'owner'
);

CREATE POLICY "Owners can update their own profile"
ON users
FOR UPDATE
USING (
  auth.uid() = auth_id AND user_type = 'owner'
);

-- Admins can manage all users
-- Reference admin_ids table for admin access
CREATE POLICY "Admins can manage all users"
ON users
FOR ALL
USING (
  auth.uid() IN (SELECT auth_id FROM admin_ids)
);

