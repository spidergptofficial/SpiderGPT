-- SpiderGPT default launch pricing. Amounts are minor currency units.
-- Change these values before launch if your commercial pricing differs.
UPDATE plans SET prices='{"INR":{"monthly":39900,"yearly":418800},"USD":{"monthly":499,"yearly":4999}}'::jsonb WHERE code='pro';
UPDATE plans SET prices='{"INR":{"monthly":99900,"yearly":1078800},"USD":{"monthly":1299,"yearly":12999}}'::jsonb WHERE code='plus';
UPDATE plans SET prices='{}'::jsonb WHERE code='free';
