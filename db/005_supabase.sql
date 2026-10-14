-- Supabase integration.
-- The application user UUID is intentionally the same UUID as the Supabase Auth user.
ALTER TABLE users ALTER COLUMN google_sub DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_user_id uuid;

UPDATE users
SET supabase_user_id = id
WHERE supabase_user_id IS NULL;

ALTER TABLE users
  ADD CONSTRAINT users_supabase_user_id_unique UNIQUE (supabase_user_id);

ALTER TABLE users
  ALTER COLUMN supabase_user_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS users_supabase_user_id_idx ON users(supabase_user_id);
