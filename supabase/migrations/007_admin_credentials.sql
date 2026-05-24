-- =====================================================
-- ADMIN CREDENTIALS TABLE
-- Stores admin login credentials securely
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_admin_credentials_updated_at 
  BEFORE UPDATE ON admin_credentials
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin credentials (for management)
CREATE POLICY "Admins can view admin credentials"
  ON admin_credentials FOR SELECT
  TO authenticated
  USING (is_admin());

-- Only admins can update admin credentials
CREATE POLICY "Admins can update admin credentials"
  ON admin_credentials FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Only admins can insert admin credentials
CREATE POLICY "Admins can insert admin credentials"
  ON admin_credentials FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Only admins can delete admin credentials
CREATE POLICY "Admins can delete admin credentials"
  ON admin_credentials FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- FUNCTION: Verify Admin Credentials
-- Checks username/email and password hash
-- =====================================================

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
  SELECT * INTO v_admin_record
  FROM admin_credentials
  WHERE (username = p_username_or_email OR email = p_username_or_email)
    AND is_active = true;

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
    UPDATE admin_credentials
    SET last_login = NOW()
    WHERE admin_credentials.id = v_admin_record.id;

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

-- =====================================================
-- FUNCTION: Create Admin Credentials
-- Creates new admin with hashed password
-- =====================================================

CREATE OR REPLACE FUNCTION create_admin_credentials(
  p_username TEXT,
  p_email TEXT,
  p_password TEXT
)
RETURNS UUID AS $$
DECLARE
  v_admin_id UUID;
  v_password_hash TEXT;
BEGIN
  -- Hash the password using bcrypt (gen_salt generates a salt)
  v_password_hash := crypt(p_password, gen_salt('bf', 10));

  -- Insert admin credentials
  INSERT INTO admin_credentials (username, email, password_hash)
  VALUES (p_username, p_email, v_password_hash)
  RETURNING id INTO v_admin_id;

  RETURN v_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Update Admin Password
-- Updates admin password with new hash
-- =====================================================

CREATE OR REPLACE FUNCTION update_admin_password(
  p_admin_id UUID,
  p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_password_hash TEXT;
BEGIN
  -- Hash the new password
  v_password_hash := crypt(p_new_password, gen_salt('bf', 10));

  -- Update password
  UPDATE admin_credentials
  SET password_hash = v_password_hash,
      updated_at = NOW()
  WHERE id = p_admin_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INSERT DEFAULT ADMIN
-- Creates default admin account
-- Username: admin
-- Email: admin@44luxury.org
-- Password: 44luxury123
-- =====================================================

-- Insert default admin (password will be hashed)
SELECT create_admin_credentials(
  'admin',
  'admin@44luxury.org',
  '44luxury123'
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE admin_credentials IS 'Stores admin login credentials with hashed passwords';
COMMENT ON FUNCTION verify_admin_credentials IS 'Verifies admin credentials and returns admin info if valid';
COMMENT ON FUNCTION create_admin_credentials IS 'Creates new admin with hashed password';
COMMENT ON FUNCTION update_admin_password IS 'Updates admin password with new hash';

