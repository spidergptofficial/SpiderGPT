ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_order_id text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan_code text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS billing_period text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS payments_user_created_idx ON payments(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS subscriptions_user_status_idx ON subscriptions(user_id,status,current_period_end DESC);
