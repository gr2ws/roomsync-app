-- Trigger function: Update property review count and average rating when a new review is inserted
CREATE OR REPLACE FUNCTION update_property_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the property's number_reviews and rating (average)
  UPDATE properties
  SET
    number_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE property_id = NEW.property_id
    ),
    rating = (
      SELECT AVG(rating)::double precision
      FROM reviews
      WHERE property_id = NEW.property_id
    )
  WHERE property_id = NEW.property_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
