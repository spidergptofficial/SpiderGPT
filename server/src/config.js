import crypto from 'node:crypto';

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  supabase: {
    url: process.env.SUPABASE_URL?.replace(/\/$/, ''),
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  aiProvider: process.env.AI_PROVIDER ?? 'gemini',
  aiKey: process.env.AI_API_KEY,
  aiModel: process.env.AI_MODEL,
  aiBaseUrl: process.env.AI_BASE_URL,
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    plans: {
      'pro:monthly': process.env.RAZORPAY_PLAN_PRO_MONTHLY,
      'pro:yearly': process.env.RAZORPAY_PLAN_PRO_YEARLY,
      'plus:monthly': process.env.RAZORPAY_PLAN_PLUS_MONTHLY,
      'plus:yearly': process.env.RAZORPAY_PLAN_PLUS_YEARLY,
    },
  },
  stripe: {
    secret: process.env.STRIPE_SECRET_KEY,
    webhook: process.env.STRIPE_WEBHOOK_SECRET,
    prices: {
      'pro:monthly': process.env.STRIPE_PRICE_PRO_MONTHLY,
      'pro:yearly': process.env.STRIPE_PRICE_PRO_YEARLY,
      'plus:monthly': process.env.STRIPE_PRICE_PLUS_MONTHLY,
      'plus:yearly': process.env.STRIPE_PRICE_PLUS_YEARLY,
    },
  },
};

export function validateConfig() {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'AI_API_KEY', 'AI_MODEL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  for (const key of required) {
    if (!process.env[key]) throw new Error(`${key} is required`);
  }
  if (config.nodeEnv === 'production') {
    if (!config.redisUrl) throw new Error('REDIS_URL is required in production');
    if (!config.jwtSecret || config.jwtSecret.length < 48) throw new Error('JWT_SECRET must be at least 48 characters in production');
    if (config.webOrigin === '*') throw new Error('WEB_ORIGIN cannot be wildcard in production');
    if (config.aiProvider === 'openai' && !config.aiBaseUrl && !config.aiKey) throw new Error('AI credentials missing');
    const paymentConfigured = (config.razorpay.keyId && config.razorpay.keySecret) || config.stripe.secret;
    if (!paymentConfigured) throw new Error('At least one payment provider must be configured in production');
  }
}

export const randomSecret = () => crypto.randomBytes(48).toString('base64url');
