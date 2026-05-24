-- Create Admin User
-- This script creates an admin user account
-- NOTE: You'll need to create the user via Supabase Auth first, then run this to set role

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- 1. First, sign up via your app's auth page with:
--    Email: admin@44luxury.com
--    Password: (your secure password)
--
-- 2. After signup, get the user ID from the profiles table
--
-- 3. Run this query, replacing YOUR_USER_ID with the actual UUID:
--    UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';
--
-- OR use this query to set admin by email:
--    UPDATE profiles SET role = 'admin' WHERE email = 'admin@44luxury.com';
-- =====================================================

-- Example: Set admin role by email
-- Uncomment and run after creating the user via auth signup:

-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email = 'admin@44luxury.com';

-- Verify admin user created
-- SELECT id, email, role, created_at 
-- FROM profiles 
-- WHERE role = 'admin';

SELECT 'Admin setup instructions displayed. Follow steps above to create admin user.' AS status;
