-- =====================================================
-- SIMPLE ADMIN AUTH (Temporary - for testing)
-- This uses plain text password comparison for debugging
-- We'll add bcrypt back once this works
-- =====================================================

-- Drop the old function
DROP FUNCTION IF EXISTS verify_admin_credentials(TEXT, TEXT);

-- Create simple version without bcrypt
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
BEGIN
  -- Get admin record by username or email
  SELECT ac.* INTO v_admin_record
  FROM admin_credentials ac
  WHERE (ac.username = p_username_or_email OR ac.email = p_username_or_email)
    AND ac.is_active = true;

  -- If no admin found, return empty
  IF NOT FOUND THEN
    RAISE NOTICE 'No admin found with username/email: %', p_username_or_email;
    RETURN;
  END IF;

  RAISE NOTICE 'Admin found: %', v_admin_record.username;
  RAISE NOTICE 'Stored hash: %', v_admin_record.password_hash;
  RAISE NOTICE 'Input password: %', p_password;

  -- Try to verify password with crypt
  BEGIN
    IF crypt(p_password, v_admin_record.password_hash) = v_admin_record.password_hash THEN
      RAISE NOTICE 'Password matches!';
      
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
    ELSE
      RAISE NOTICE 'Password does not match';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error in crypt: %', SQLERRM;
      RETURN;
  END;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT * FROM verify_admin_credentials('admin', '44luxury123');

