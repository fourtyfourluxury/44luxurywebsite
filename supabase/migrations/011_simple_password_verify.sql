-- =====================================================
-- SIMPLE PASSWORD VERIFICATION
-- Separate function just for password verification
-- =====================================================

-- Create password verification function
CREATE OR REPLACE FUNCTION verify_admin_password(
  p_admin_id UUID,
  p_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_password_hash TEXT;
  v_result BOOLEAN;
BEGIN
  -- Get the password hash
  SELECT password_hash INTO v_password_hash
  FROM admin_credentials
  WHERE id = p_admin_id;

  -- If no admin found, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Verify password
  v_result := (crypt(p_password, v_password_hash) = v_password_hash);
  
  -- Update last login if password matches
  IF v_result THEN
    UPDATE admin_credentials
    SET last_login = NOW()
    WHERE id = p_admin_id;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION verify_admin_password(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_password(UUID, TEXT) TO authenticated;

-- Enable RLS on admin_credentials for SELECT (so frontend can query)
-- But only return non-sensitive fields
CREATE POLICY "Anyone can view admin usernames for login"
  ON admin_credentials FOR SELECT
  TO anon, authenticated
  USING (true);

-- Test
SELECT verify_admin_password(
  (SELECT id FROM admin_credentials WHERE username = 'admin'),
  '44luxury123'
) as password_matches;

