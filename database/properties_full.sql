-- Access Policies
-- Renters: Can view all properties, but cannot edit.
-- Owners: Can view and edit only their own properties.
-- Admins: Can view, edit, and manage all properties.
--
-- PROPERTIES TABLE
CREATE TYPE property_category AS ENUM ('rooms', 'apartments', 'bedspace');

CREATE TABLE properties (
  property_id SERIAL PRIMARY KEY,
  owner_id INT NOT NULL REFERENCES users(user_id),
  title TEXT NOT NULL,
  description TEXT,
  category property_category NOT NULL,
  street TEXT,
  barangay TEXT,
  city TEXT,
  coordinates TEXT,
  image_url TEXT[],
  rent NUMERIC NOT NULL,
  amenities TEXT[],
  rating FLOAT,
  max_renters INT NOT NULL,
  is_available BOOLEAN NOT NULL,
  landmarks TEXT[]
);


ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Renters can view all properties
CREATE POLICY "Renters can view all properties"
ON properties
FOR SELECT
USING (true);

-- Owners can view their own properties
CREATE POLICY "Owners can view their own properties"
ON properties
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = owner_id AND u.auth_id = auth.uid()
  )
);

-- Owners can update their own properties
CREATE POLICY "Owners can update their own properties"
ON properties
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = owner_id AND u.auth_id = auth.uid()
  )
);

-- Owners can insert their own properties
CREATE POLICY "Owners can insert their own properties"
ON properties
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = owner_id AND u.auth_id = auth.uid()
  )
);

-- Admins can manage all properties
CREATE POLICY "Admins can manage all properties"
ON properties
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);
