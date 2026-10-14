import Redis from 'ioredis';
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { ApiError } from './errors.js';
import { config } from './config.js';
const redis = config.redisUrl ? new Redis(config.redisUrl,{enableOfflineQueue:false,maxRetriesPerRequest:2}) : null;
const cache = new Map();
const make = (name,points,duration) => redis ? new RateLimiterRedis({storeClient:redis,keyPrefix:`rl:${name}`,points,duration}) : new RateLimiterMemory({keyPrefix:`rl:${name}`,points,duration});
export const limit=(name,points,duration)=>{ const rl=make(name,points,duration); return async(req,_res,next)=>{ try{await rl.consume(req.user?.id ?? req.ip);next();}catch(e){next(new ApiError(429,'rate_limited','Easy there — too many requests. Give it a moment.'));} }; };
