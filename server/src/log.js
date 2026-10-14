import pino from 'pino';
export const log = pino({ level: process.env.LOG_LEVEL ?? 'info', redact: ['req.headers.cookie','req.headers.authorization','*.token','*.idToken','*.apiKey','*.secret','*.password'] });
