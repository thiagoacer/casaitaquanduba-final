/*
  # Fix Security Issues

  1. Changes
    - Remove duplicate RLS policies for booking_inquiries (DELETE and UPDATE)
    - Drop unused indexes to improve performance
    - Add missing index for payments.created_by foreign key
    - Fix function search paths to be immutable
    - Drop security definer view and replace with regular view
  
  2. Security
    - Consolidate duplicate policies to prevent conflicts
    - Fix function security issues with proper search paths
    - Remove security definer from view to prevent privilege escalation
*/

-- 1. Fix duplicate policies on booking_inquiries
DROP POLICY IF EXISTS "Authenticated users can delete bookings" ON booking_inquiries;
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON booking_inquiries;

-- Keep only the newer policies with clearer names
-- These already exist: "Authenticated users can delete booking inquiries" and "Authenticated users can update booking inquiries"

-- 2. Drop unused indexes
DROP INDEX IF EXISTS idx_contact_submissions_status;
DROP INDEX IF EXISTS idx_contact_submissions_created;
DROP INDEX IF EXISTS idx_booking_inquiries_updated;
DROP INDEX IF EXISTS idx_pricing_rules_season;
DROP INDEX IF EXISTS idx_blocked_dates_date;
DROP INDEX IF EXISTS idx_booking_inquiries_dates;
DROP INDEX IF EXISTS idx_booking_inquiries_status;
DROP INDEX IF EXISTS idx_booking_inquiries_created;
DROP INDEX IF EXISTS idx_payments_booking_id;
DROP INDEX IF EXISTS idx_payments_payment_date;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_booking_inquiries_confirmed_at;
DROP INDEX IF EXISTS idx_booking_inquiries_cancelled_at;

-- 3. Add missing index for foreign key
CREATE INDEX IF NOT EXISTS idx_payments_created_by ON payments(created_by);

-- 4. Drop and recreate security definer view as regular view
DROP VIEW IF EXISTS booking_statistics CASCADE;

CREATE VIEW booking_statistics AS
SELECT
  COUNT(*) AS total_bookings,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_bookings,
  COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed_bookings,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_bookings,
  COALESCE(SUM(calculated_price) FILTER (WHERE status = 'confirmed'), 0) AS total_revenue,
  COALESCE(SUM(total_paid) FILTER (WHERE status = 'confirmed'), 0) AS total_paid_amount,
  COALESCE(AVG(calculated_price) FILTER (WHERE status = 'confirmed'), 0) AS avg_booking_value,
  COALESCE(AVG(num_nights) FILTER (WHERE status = 'confirmed'), 0) AS avg_stay_duration
FROM booking_inquiries;

-- 5. Fix function search paths
DROP FUNCTION IF EXISTS calculate_total_paid(uuid);
CREATE FUNCTION calculate_total_paid(p_booking_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
SELECT COALESCE(SUM(amount), 0)
FROM payments
WHERE booking_id = p_booking_id
AND payment_status = 'completed';
$$;

DROP FUNCTION IF EXISTS update_booking_total_paid() CASCADE;
CREATE FUNCTION update_booking_total_paid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE booking_inquiries
    SET total_paid = calculate_total_paid(OLD.booking_id)
    WHERE id = OLD.booking_id;
    RETURN OLD;
  ELSE
    UPDATE booking_inquiries
    SET total_paid = calculate_total_paid(NEW.booking_id)
    WHERE id = NEW.booking_id;
    RETURN NEW;
  END IF;
END;
$$;

-- Recreate trigger if it exists
DROP TRIGGER IF EXISTS update_booking_total_paid_trigger ON payments;
CREATE TRIGGER update_booking_total_paid_trigger
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_booking_total_paid();