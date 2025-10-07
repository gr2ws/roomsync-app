-- Access Policies
-- Renters: Can create reports.
-- Owners: Can view reports related to their own properties.
-- Admins: Can view, edit, and manage all reports.
--
-- REPORTS TABLE
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved');

CREATE TABLE reports (
  report_id SERIAL PRIMARY KEY,
  reported_by INT NOT NULL REFERENCES users(user_id),
  reported_user INT REFERENCES users(user_id),
  property_id INT REFERENCES properties(property_id),
  reason TEXT NOT NULL,
  description TEXT,
  status report_status NOT NULL DEFAULT 'pending',
  reviewed_by INT REFERENCES users(user_id),
  date_created TIMESTAMP NOT NULL,
  date_resolved TIMESTAMP
);


ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Renters can create (insert) their own reports
CREATE POLICY "Renters can create their own reports"
ON reports
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = reported_by AND u.auth_id = auth.uid() AND u.user_type = 'renter'
  )
);

-- Reporter can view their own reports
CREATE POLICY "Reporter can view their own reports"
ON reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = reported_by AND u.auth_id = auth.uid()
  )
);

-- Owners can view reports related to their own properties
CREATE POLICY "Owners can view reports for their properties"
ON reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.owner_id = (SELECT u.user_id FROM users u WHERE u.auth_id = auth.uid())
      AND p.property_id = property_id
  )
);

-- Admins can manage all reports
CREATE POLICY "Admins can manage all reports"
ON reports
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);
