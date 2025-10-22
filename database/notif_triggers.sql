-- Helper function: Get all admin auth_ids
CREATE OR REPLACE FUNCTION get_admin_auth_ids()
RETURNS TABLE(auth_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT u.auth_id
  FROM users u
  WHERE u.user_type = 'admin'
    AND u.auth_id IS NOT NULL
    AND u.is_banned = false;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Notify renter when application is rejected
CREATE OR REPLACE FUNCTION notify_application_rejected()
RETURNS TRIGGER AS $$
DECLARE
  renter_auth_id uuid;
BEGIN
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    SELECT auth_id INTO renter_auth_id
    FROM users WHERE user_id = NEW.renter_id;

    IF renter_auth_id IS NOT NULL THEN
      INSERT INTO notifications (notif_type, user_auth_id, created_at)
      VALUES ('rental_application_rejected', renter_auth_id, NOW());
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_application_rejected
AFTER UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION notify_application_rejected();

-- Trigger: Notify renter and owner when application is cancelled
CREATE OR REPLACE FUNCTION notify_application_cancelled()
RETURNS TRIGGER AS $$
DECLARE
  renter_auth_id uuid;
  owner_auth_id uuid;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    -- Notify renter
    SELECT auth_id INTO renter_auth_id
    FROM users WHERE user_id = NEW.renter_id;

    IF renter_auth_id IS NOT NULL THEN
      INSERT INTO notifications (notif_type, user_auth_id, created_at)
      VALUES ('rental_application_cancelled', renter_auth_id, NOW());
    END IF;

    -- Notify owner
    SELECT auth_id INTO owner_auth_id
    FROM users WHERE user_id = NEW.owner_id;

    IF owner_auth_id IS NOT NULL THEN
      INSERT INTO notifications (notif_type, user_auth_id, created_at)
      VALUES ('rental_application_cancelled', owner_auth_id, NOW());
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_application_cancelled
AFTER UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION notify_application_cancelled();

-- Trigger: Notify renter when application is accepted
CREATE OR REPLACE FUNCTION notify_application_accepted()
RETURNS TRIGGER AS $$
DECLARE
  renter_auth_id uuid;
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    SELECT auth_id INTO renter_auth_id
    FROM users WHERE user_id = NEW.renter_id;

    IF renter_auth_id IS NOT NULL THEN
      INSERT INTO notifications (notif_type, user_auth_id, created_at)
      VALUES ('rental_application_accepted', renter_auth_id, NOW());
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_application_accepted
AFTER UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION notify_application_accepted();

-- Trigger: Notify renter and owner when rental is completed
CREATE OR REPLACE FUNCTION notify_application_completed()
RETURNS TRIGGER AS $$
DECLARE
  renter_auth_id uuid;
  owner_auth_id uuid;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Notify renter
    SELECT auth_id INTO renter_auth_id
    FROM users WHERE user_id = NEW.renter_id;

    IF renter_auth_id IS NOT NULL THEN
      INSERT INTO notifications (notif_type, user_auth_id, created_at)
      VALUES ('rental_application_completed', renter_auth_id, NOW());
    END IF;

    -- Notify owner
    SELECT auth_id INTO owner_auth_id
    FROM users WHERE user_id = NEW.owner_id;

    IF owner_auth_id IS NOT NULL THEN
      INSERT INTO notifications (notif_type, user_auth_id, created_at)
      VALUES ('rental_application_completed', owner_auth_id, NOW());
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_application_completed
AFTER UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION notify_application_completed();

-- Trigger: Notify user when account receives a warning
CREATE OR REPLACE FUNCTION notify_user_warned()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_warned = true AND OLD.is_warned = false THEN
    IF NEW.auth_id IS NOT NULL THEN
      INSERT INTO notifications (notif_type, user_auth_id, created_at)
      VALUES ('user_account_warned', NEW.auth_id, NOW());
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_warned
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION notify_user_warned();

-- Trigger: Notify user when account is verified
CREATE OR REPLACE FUNCTION notify_user_verified()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_verified = true AND OLD.is_verified = false THEN
    IF NEW.auth_id IS NOT NULL THEN
      INSERT INTO notifications (notif_type, user_auth_id, created_at)
      VALUES ('user_account_verified', NEW.auth_id, NOW());
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_verified
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION notify_user_verified();

-- Trigger: Notify renter and owner when rental ends
CREATE OR REPLACE FUNCTION notify_rental_ended()
RETURNS TRIGGER AS $$
DECLARE
  owner_auth_id uuid;
BEGIN
  IF OLD.rented_property IS NOT NULL AND NEW.rented_property IS NULL THEN
    -- Notify renter
    IF NEW.auth_id IS NOT NULL THEN
      INSERT INTO notifications (notif_type, user_auth_id, created_at)
      VALUES ('rental_ended', NEW.auth_id, NOW());
    END IF;

    -- Notify owner of the previous property
    SELECT u.auth_id INTO owner_auth_id
    FROM users u
    JOIN properties p ON p.owner_id = u.user_id
    WHERE p.property_id = OLD.rented_property;

    IF owner_auth_id IS NOT NULL THEN
      INSERT INTO notifications (notif_type, user_auth_id, created_at)
      VALUES ('rental_ended', owner_auth_id, NOW());
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_rental_ended
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION notify_rental_ended();

-- Trigger: Notify owner when someone applies to their property
CREATE OR REPLACE FUNCTION notify_new_application()
RETURNS TRIGGER AS $$
DECLARE
  owner_auth_id uuid;
BEGIN
  SELECT auth_id INTO owner_auth_id
  FROM users WHERE user_id = NEW.owner_id;

  IF owner_auth_id IS NOT NULL THEN
    INSERT INTO notifications (notif_type, user_auth_id, created_at)
    VALUES ('new_rental_application', owner_auth_id, NOW());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_application
AFTER INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION notify_new_application();

-- Trigger: Notify owner when property is verified
CREATE OR REPLACE FUNCTION notify_property_verified()
RETURNS TRIGGER AS $$
DECLARE
  owner_auth_id uuid;
BEGIN
  IF NEW.is_verified = true AND OLD.is_verified = false THEN
    SELECT auth_id INTO owner_auth_id
    FROM users WHERE user_id = NEW.owner_id;

    IF owner_auth_id IS NOT NULL THEN
      INSERT INTO notifications (notif_type, user_auth_id, created_at)
      VALUES ('property_verified', owner_auth_id, NOW());
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_property_verified
AFTER UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION notify_property_verified();

-- Trigger: Notify owner when review is posted on their property
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
DECLARE
  owner_auth_id uuid;
BEGIN
  SELECT u.auth_id INTO owner_auth_id
  FROM users u
  JOIN properties p ON p.owner_id = u.user_id
  WHERE p.property_id = NEW.property_id;

  IF owner_auth_id IS NOT NULL THEN
    INSERT INTO notifications (notif_type, user_auth_id, created_at)
    VALUES ('new_review', owner_auth_id, NOW());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_review
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION notify_new_review();

-- Trigger: Notify all admins when property is submitted
CREATE OR REPLACE FUNCTION notify_new_property()
RETURNS TRIGGER AS $$
DECLARE
  admin_auth_id uuid;
BEGIN
  FOR admin_auth_id IN SELECT auth_id FROM get_admin_auth_ids()
  LOOP
    INSERT INTO notifications (notif_type, user_auth_id, created_at)
    VALUES ('new_property_submission', admin_auth_id, NOW());
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_property
AFTER INSERT ON properties
FOR EACH ROW
EXECUTE FUNCTION notify_new_property();

-- Trigger: Notify all admins when report is submitted
CREATE OR REPLACE FUNCTION notify_new_report()
RETURNS TRIGGER AS $$
DECLARE
  admin_auth_id uuid;
BEGIN
  FOR admin_auth_id IN SELECT auth_id FROM get_admin_auth_ids()
  LOOP
    INSERT INTO notifications (notif_type, user_auth_id, created_at)
    VALUES ('new_report', admin_auth_id, NOW());
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_report
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION notify_new_report();

-- Trigger: Notify all admins when user registers
CREATE OR REPLACE FUNCTION notify_new_registration()
RETURNS TRIGGER AS $$
DECLARE
  admin_auth_id uuid;
BEGIN
  FOR admin_auth_id IN SELECT auth_id FROM get_admin_auth_ids()
  LOOP
    INSERT INTO notifications (notif_type, user_auth_id, created_at)
    VALUES ('new_registration', admin_auth_id, NOW());
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_registration
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION notify_new_registration();