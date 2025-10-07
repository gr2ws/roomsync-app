-- Access Policies
-- Renters: Can create reviews and view all reviews.
-- Owners: Can view reviews for their own properties.
-- Admins: Can view, edit, and manage all reviews.
--
-- REVIEWS TABLE
CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id),
  property_id INT NOT NULL REFERENCES properties(property_id),
  rating INT NOT NULL,
  comment TEXT,
  upvotes INT NOT NULL DEFAULT 0,
  downvotes INT NOT NULL DEFAULT 0,
  date_created TIMESTAMP NOT NULL
);


ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Renters can create (insert) their own reviews
CREATE POLICY "Renters can create their own reviews"
ON reviews
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = user_id AND u.auth_id = auth.uid() AND u.user_type = 'renter'
  )
);

-- Renters can view all reviews
CREATE POLICY "Renters can view all reviews"
ON reviews
FOR SELECT
USING (true);

-- Owners can view reviews for their own properties
CREATE POLICY "Owners can view reviews for their properties"
ON reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.owner_id = (SELECT u.user_id FROM users u WHERE u.auth_id = auth.uid())
      AND p.property_id = property_id
  )
);

-- Renter can view their own reviews
CREATE POLICY "Renter can view their own reviews"
ON reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = user_id AND u.auth_id = auth.uid() AND u.user_type = 'renter'
  )
);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews"
ON reviews
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);
