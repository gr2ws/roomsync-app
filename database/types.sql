CREATE TYPE public.user_type AS ENUM ('renter', 'owner', 'admin');

CREATE TYPE public.property_category AS ENUM ('room', 'apartment', 'bedspace');

CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'completed');

CREATE TYPE public.report_status AS ENUM ('pending', 'under investigation', 'resolved', 'dismissed');

CREATE TYPE public.notification_type AS ENUM (
  'rental_application_rejected',
  'rental_application_cancelled',
  'rental_application_accepted',
  'user_account_warned',
  'user_account_verified',
  'rental_ended',
  'new_rental_application',
  'property_verified',
  'new_review',
  'new_property_submission',
  'new_report',
  'new_registration',
  'rental_application_completed',
  'user_reported'
);