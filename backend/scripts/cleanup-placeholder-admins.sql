-- ==============================================================================
-- Mehandi By Sana: Production Admin User Cleanup Script
-- 
-- Safely deletes placeholder admin accounts:
--   - admin@mehandibysana.com
--   - sana@mehandibysana.com
--   - atelier@mehandibysana.com
--   - owner@mehandibysana.com
--
-- EXPLICITLY PRESERVES AND NEVER TOUCHES:
--   - sumaiyamagray@gmail.com
--   - nazrulislambhat@gmail.com
--   - All store customers in the "customer" table
-- ==============================================================================

BEGIN;

-- 1. Identify target placeholder user IDs
WITH target_users AS (
  SELECT id, email
  FROM "user"
  WHERE email IN (
    'admin@mehandibysana.com',
    'sana@mehandibysana.com',
    'atelier@mehandibysana.com',
    'owner@mehandibysana.com'
  )
  AND email NOT IN ('sumaiyamagray@gmail.com', 'nazrulislambhat@gmail.com')
),
target_auths AS (
  SELECT ai.id AS auth_id
  FROM auth_identity ai
  JOIN target_users tu ON ai.app_metadata->>'user_id' = tu.id
)

-- 2. Delete provider identities (passwords/hashes) for placeholder users
DELETE FROM provider_identity
WHERE auth_identity_id IN (SELECT auth_id FROM target_auths)
   OR entity_id IN (SELECT email FROM target_users);

-- 3. Delete auth identities for placeholder users
DELETE FROM auth_identity
WHERE id IN (
  SELECT ai.id
  FROM auth_identity ai
  JOIN "user" u ON ai.app_metadata->>'user_id' = u.id
  WHERE u.email IN (
    'admin@mehandibysana.com',
    'sana@mehandibysana.com',
    'atelier@mehandibysana.com',
    'owner@mehandibysana.com'
  )
  AND u.email NOT IN ('sumaiyamagray@gmail.com', 'nazrulislambhat@gmail.com')
);

-- 4. Delete invites if any were created for placeholder emails
DELETE FROM invite
WHERE email IN (
  'admin@mehandibysana.com',
  'sana@mehandibysana.com',
  'atelier@mehandibysana.com',
  'owner@mehandibysana.com'
)
AND email NOT IN ('sumaiyamagray@gmail.com', 'nazrulislambhat@gmail.com');

-- 5. Delete the placeholder user records
DELETE FROM "user"
WHERE email IN (
  'admin@mehandibysana.com',
  'sana@mehandibysana.com',
  'atelier@mehandibysana.com',
  'owner@mehandibysana.com'
)
AND email NOT IN ('sumaiyamagray@gmail.com', 'nazrulislambhat@gmail.com');

COMMIT;

-- Verify remaining active admin users (should only show sumaiyamagray@gmail.com & nazrulislambhat@gmail.com)
SELECT id, email, first_name, last_name, created_at FROM "user";
