-- =====================================================
-- GRANT RPC PERMISSIONS
-- Allow anonymous users to call admin auth functions
-- =====================================================

-- Grant execute permission to anon role (used by frontend)
GRANT EXECUTE ON FUNCTION verify_admin_credentials(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_credentials(TEXT, TEXT) TO authenticated;

-- Grant execute on other admin functions
GRANT EXECUTE ON FUNCTION create_admin_credentials(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_admin_password(UUID, TEXT) TO authenticated;

-- Test that it works
SELECT 'Permissions granted successfully' as status;

