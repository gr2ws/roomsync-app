-- Access Policies
-- Renters: Can create applications and view their own applications.
-- Owners: Can view and edit applications to their own properties.
-- Admins: Can view, edit, and manage all applications.
--
-- APPLICATIONS TABLE
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE applications (
  application_id SERIAL PRIMARY KEY,
  property_id INT NOT NULL REFERENCES properties(property_id),
  renter_id INT NOT NULL REFERENCES users(user_id),
  owner_id INT NOT NULL REFERENCES users(user_id),
  status application_status NOT NULL DEFAULT 'pending',
  message TEXT,
  date_applied TIMESTAMP NOT NULL,
  date_updated TIMESTAMP
);


ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Renters can create (insert) their own applications
CREATE POLICY "Renter can create their own applications"
ON applications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = renter_id AND u.auth_id = auth.uid()
  )
);

-- Renters can view their own applications
CREATE POLICY "Renter can view their own applications"
ON applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = renter_id AND u.auth_id = auth.uid()
  )
);

-- Owners can view applications to their own properties
CREATE POLICY "Owner can view their own applications"
ON applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = owner_id AND u.auth_id = auth.uid()
  )
);

-- Owners can edit (update) applications to their own properties
CREATE POLICY "Owner can edit their own applications"
ON applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = owner_id AND u.auth_id = auth.uid()
  )
);

-- Admins can manage all applications
CREATE POLICY "Admins can manage all applications"
ON applications
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);
