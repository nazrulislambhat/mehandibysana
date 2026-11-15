-- ==============================================================================
-- Update Medusa admin user from sumaiyamagray@gmail.com / mehandibysana@gmail.com
-- to sana@mehandibysana.com
-- ==============================================================================

BEGIN;

UPDATE "user"
SET email = 'sana@mehandibysana.com'
WHERE email IN ('sumaiyamagray@gmail.com', 'mehandibysana@gmail.com');

UPDATE provider_identity
SET entity_id = 'sana@mehandibysana.com'
WHERE entity_id IN ('sumaiyamagray@gmail.com', 'mehandibysana@gmail.com');

COMMIT;

-- Verify
SELECT id, email, first_name, last_name FROM "user";
