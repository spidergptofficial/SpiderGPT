import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import { ApiError } from './errors.js';
import { limit } from './ratelimit.js';
import { config } from './config.js';

const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const prod = config.nodeEnv === 'production';
const cookie = (path, maxAge) => ({ httpOnly: true, secure: prod, sameSite: 'strict', path, maxAge });
const REFRESH_MS = 30 * 864e5;

async function issue(res, userId) {
  const access = jwt.sign(
    { sub: userId },
    config.jwtSecret,
    { expiresIn: '15m', issuer: 'spidergpt', audience: 'spidergpt-web' },
  );

  const refresh = crypto.randomBytes(48).toString('base64url');

  await db.query(
    'INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES($1,$2,now()+$3::interval)',
    [userId, sha(refresh), `${REFRESH_MS} milliseconds`],
  );

  res.cookie('sg_access', access, cookie('/', 15 * 60e3))
    .cookie('sg_refresh', refresh, cookie('/auth', REFRESH_MS));
}

async function getSupabaseUser(accessToken) {
  const response = await fetch(`${config.supabase.url}/auth/v1/user`, {
    headers: {
      apikey: config.supabase.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) return null;

  return response.json();
}

export async function requireAuth(req, _res, next) {
  try {
    const { sub } = jwt.verify(req.cookies.sg_access ?? '', config.jwtSecret, {
      issuer: 'spidergpt',
      audience: 'spidergpt-web',
    });

    const r = await db.query(
      'SELECT id FROM users WHERE id=$1 AND deleted_at IS NULL',
      [sub],
    );

    if (!r.rows[0]) throw 0;

    req.user = r.rows[0];
    next();
  } catch {
    next(new ApiError(401, 'unauthorized', 'Please sign in to continue.'));
  }
}

export const csrfGuard = (req, _res, next) =>
  ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ||
  req.get('x-requested-with') === 'spidergpt'
    ? next()
    : next(new ApiError(403, 'csrf', 'Request blocked.'));

export const authRouter = Router();

authRouter.post('/supabase', limit('auth', 10, 60), async (req, res) => {
  const { accessToken } = z
    .object({
      accessToken: z.string().min(20).max(8192),
    })
    .parse(req.body);

  const user = await getSupabaseUser(accessToken);

  if (!user?.id || !user.email || !user.email_confirmed_at) {
    throw new ApiError(
      401,
      'invalid_token',
      'Your Google account could not be verified.',
    );
  }

  const isGoogle = user.identities?.some(
    identity => identity.provider === 'google',
  );

  if (!isGoogle) {
    throw new ApiError(
      403,
      'google_required',
      'Please continue with Google.',
    );
  }

  const email = user.email.toLowerCase();
  const userId = user.id;

  const googleIdentity = user.identities?.find(
    identity => identity.provider === 'google',
  );

  const googleSub =
    googleIdentity?.identity_data?.sub ??
    googleIdentity?.id ??
    userId;

  const { rows } = await db.query(
    `INSERT INTO users(id, supabase_user_id, google_sub, email)
     VALUES($1::uuid,$1::uuid,$2::text,$3::text)
     ON CONFLICT(supabase_user_id) DO UPDATE
       SET email=EXCLUDED.email, google_sub=EXCLUDED.google_sub
       WHERE users.deleted_at IS NULL
     RETURNING id`,
    [userId, googleSub, email],
  );

  if (!rows[0]) {
    throw new ApiError(
      403,
      'account_deleted',
      'This account was deleted.',
    );
  }

  await issue(res, rows[0].id);

  res.json({ ok: true });
});

authRouter.post('/refresh', limit('refresh', 30, 60), async (req, res) => {
  const t = req.cookies.sg_refresh;

  if (!t) {
    throw new ApiError(
      401,
      'unauthorized',
      'Please sign in again.',
    );
  }

  const r = await db.query(
    `UPDATE refresh_tokens
     SET revoked_at=now()
     WHERE token_hash=$1
       AND revoked_at IS NULL
       AND expires_at>now()
     RETURNING user_id`,
    [sha(t)],
  );

  if (!r.rows[0]) {
    throw new ApiError(
      401,
      'unauthorized',
      'Please sign in again.',
    );
  }

  await issue(res, r.rows[0].user_id);

  res.json({ ok: true });
});

authRouter.post('/logout', async (req, res) => {
  if (req.cookies.sg_refresh) {
    await db.query(
      'UPDATE refresh_tokens SET revoked_at=now() WHERE token_hash=$1',
      [sha(req.cookies.sg_refresh)],
    );
  }

  res.clearCookie('sg_access', { path: '/' })
    .clearCookie('sg_refresh', { path: '/auth' })
    .json({ ok: true });
});