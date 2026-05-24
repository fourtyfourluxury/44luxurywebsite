-- =====================================================
-- FIX: Admin Credentials Function
-- Fixes ambiguous column reference error
-- =====================================================

-- Drop the old function
DROP FUNCTION IF EXISTS verify_admin_credentials(TEXT, TEXT);

-- Recreate with fixed column references
CREATE OR REPLACE FUNCTION verify_admin_credentials(
  p_username_or_email TEXT,
  p_password TEXT
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  email TEXT,
  is_active BOOLEAN
) AS $$
DECLARE
  v_admin_record RECORD;
  v_password_hash TEXT;
BEGIN
  -- Get admin record by username or email
  -- Use table alias to avoid ambiguity
  SELECT ac.* INTO v_admin_record
  FROM admin_credentials ac
  WHERE (ac.username = p_username_or_email OR ac.email = p_username_or_email)
    AND ac.is_active = true;

  -- If no admin found, return empty
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Hash the provided password with the stored hash for comparison
  -- Using crypt function from pgcrypto extension
  v_password_hash := crypt(p_password, v_admin_record.password_hash);

  -- If password matches, return admin info
  IF v_password_hash = v_admin_record.password_hash THEN
    -- Update last login
    UPDATE admin_credentials ac
    SET last_login = NOW()
    WHERE ac.id = v_admin_record.id;

    -- Return admin info
    RETURN QUERY
    SELECT 
      v_admin_record.id,
      v_admin_record.username,
      v_admin_record.email,
      v_admin_record.is_active;
  END IF;

  -- If password doesn't match, return empty
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT * FROM verify_admin_credentials('admin', '44luxury123');

