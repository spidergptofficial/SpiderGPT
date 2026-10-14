import pg from 'pg';
import { config } from './config.js';
export const db = new pg.Pool({ connectionString: config.databaseUrl, max: 15, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000, options: '-c timezone=UTC' });
