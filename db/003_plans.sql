ALTER TABLE plans ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS sort int NOT NULL DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS active bool NOT NULL DEFAULT true;
UPDATE plans SET name='Free',sort=0 WHERE code='free';
UPDATE plans SET name='Pro',sort=1 WHERE code='pro';
UPDATE plans SET name='Plus',sort=2 WHERE code='plus';
