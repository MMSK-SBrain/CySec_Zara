import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";

// Global daily cap across all users
const globalDailyLimiter = new RateLimiterMemory({
  keyPrefix: "zara_global_daily",
  points: Number(process.env.MAX_DAILY_AI_CALLS || 200),
  duration: 24 * 60 * 60,
});

// Per-session cap
const sessionLimiter = new RateLimiterMemory({
  keyPrefix: "zara_session",
  points: Number(process.env.MAX_AI_CALLS_PER_SESSION || 20),
  duration: 60 * 60 * 24,
});

// Per-IP hourly cap
const ipLimiter = new RateLimiterMemory({
  keyPrefix: "zara_ip",
  points: Number(process.env.MAX_AI_CALLS_PER_IP_HOUR || 100),
  duration: 60 * 60,
});

export async function checkZaraRateLimits(sessionKey: string, ip: string) {
  try {
    await Promise.all([
      globalDailyLimiter.consume("global", 1),
      sessionLimiter.consume(sessionKey, 1),
      ipLimiter.consume(ip, 1),
    ]);
    return { allowed: true };
  } catch (rej) {
    const res = rej as RateLimiterRes;
    return {
      allowed: false,
      retryAfter: Math.ceil(res.msBeforeNext / 1000),
    };
  }
}
