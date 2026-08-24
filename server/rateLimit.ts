import { TRPCError } from "@trpc/server";
import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextFunction, Request, Response } from "express";

export type RateLimitName =
  | "authCallback"
  | "feedback"
  | "protectedMutation"
  | "qr";

type RateLimitConfig = {
  limit: number;
  prefix: string;
  window: Duration;
};

type RateLimitResult = {
  reset?: number;
  success: boolean;
};

const rateLimitConfigs: Record<RateLimitName, RateLimitConfig> = {
  authCallback: {
    limit: 30,
    prefix: "auth-callback",
    window: "15 m",
  },
  feedback: {
    limit: 5,
    prefix: "feedback",
    window: "1 h",
  },
  protectedMutation: {
    limit: 60,
    prefix: "protected-mutation",
    window: "15 m",
  },
  qr: {
    limit: 30,
    prefix: "qr",
    window: "1 h",
  },
};

const memoryHits = new Map<string, { count: number; resetAt: number }>();

let redisLimiters: Partial<Record<RateLimitName, Ratelimit>> | null = null;
let redisLimitersInitialized = false;

export function getClientIp(req: Request) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0];

  return (
    forwardedIp?.trim() ||
    req.ip ||
    req.socket.remoteAddress ||
    "unknown-client"
  );
}

export async function enforceTrpcRateLimit(
  name: RateLimitName,
  identifier: string,
) {
  const result = await checkRateLimit(name, identifier);

  if (!result.success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again later.",
    });
  }
}

export function createExpressRateLimitMiddleware(
  name: RateLimitName,
  getIdentifier: (req: Request) => string = getClientIp,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await checkRateLimit(name, getIdentifier(req));

    if (!result.success) {
      if (result.reset) {
        res.setHeader("Retry-After", getRetryAfterSeconds(result.reset));
      }

      res.status(429).json({
        error: "Too many requests. Please try again later.",
      });
      return;
    }

    next();
  };
}

async function checkRateLimit(
  name: RateLimitName,
  identifier: string,
): Promise<RateLimitResult> {
  const redisLimiter = getRedisLimiter(name);

  if (redisLimiter) {
    try {
      const result = await redisLimiter.limit(identifier);

      return {
        reset: result.reset,
        success: result.success,
      };
    } catch (error) {
      console.error(`Rate limit check failed for ${name}:`, error);
      return { success: true };
    }
  }

  return checkMemoryRateLimit(name, identifier);
}

function getRedisLimiter(name: RateLimitName) {
  if (!redisLimitersInitialized) {
    redisLimitersInitialized = true;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
      const redis = new Redis({ token, url });
      redisLimiters = Object.fromEntries(
        Object.entries(rateLimitConfigs).map(([limitName, config]) => [
          limitName,
          new Ratelimit({
            analytics: false,
            limiter: Ratelimit.fixedWindow(config.limit, config.window),
            prefix: `menu-nook:${config.prefix}`,
            redis,
            timeout: 1_500,
          }),
        ]),
      ) as Record<RateLimitName, Ratelimit>;
    }
  }

  return redisLimiters?.[name] ?? null;
}

function checkMemoryRateLimit(
  name: RateLimitName,
  identifier: string,
): RateLimitResult {
  const now = Date.now();
  const config = rateLimitConfigs[name];
  const key = `${config.prefix}:${identifier}`;
  const existing = memoryHits.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + getWindowMs(config.window);
    memoryHits.set(key, { count: 1, resetAt });

    return { reset: resetAt, success: true };
  }

  if (existing.count >= config.limit) {
    return { reset: existing.resetAt, success: false };
  }

  existing.count += 1;

  return { reset: existing.resetAt, success: true };
}

function getWindowMs(window: Duration) {
  const match = /^(\d+)\s*(ms|s|m|h|d)$/.exec(window);

  if (!match) {
    throw new Error(`Invalid rate limit window: ${window}`);
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    d: 24 * 60 * 60 * 1_000,
    h: 60 * 60 * 1_000,
    m: 60 * 1_000,
    ms: 1,
    s: 1_000,
  };

  return value * multipliers[unit];
}

function getRetryAfterSeconds(reset: number) {
  return Math.max(1, Math.ceil((reset - Date.now()) / 1_000));
}
