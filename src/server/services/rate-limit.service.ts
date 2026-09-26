import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number; // seconds
}

export class RateLimitService {
  private static DEFAULT_MAX_ATTEMPTS = 5;
  private static DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  /**
   * Checks whether the current key has exceeded the rate limit.
   */
  static async checkRateLimit(
    key: string,
    maxAttempts = this.DEFAULT_MAX_ATTEMPTS,
    windowMs = this.DEFAULT_WINDOW_MS
  ): Promise<RateLimitResult> {
    const now = new Date();
    const record = await prisma.rateLimitRecord.findUnique({
      where: { key },
    });

    if (!record) {
      return { allowed: true, remaining: maxAttempts };
    }

    const windowExpiry = new Date(record.windowStart.getTime() + windowMs);
    if (now > windowExpiry) {
      // Previous window has expired
      return { allowed: true, remaining: maxAttempts };
    }

    if (record.attempts >= maxAttempts) {
      const retryAfter = Math.ceil((windowExpiry.getTime() - now.getTime()) / 1000);
      return { allowed: false, remaining: 0, retryAfter };
    }

    return { allowed: true, remaining: maxAttempts - record.attempts };
  }

  /**
   * Records a failed attempt for the given key in PostgreSQL.
   * Uses atomic ON CONFLICT to eliminate P2002 race conditions under concurrent failed requests.
   */
  static async recordFailedAttempt(
    key: string,
    windowMs = this.DEFAULT_WINDOW_MS
  ): Promise<void> {
    const now = new Date();
    const id = crypto.randomUUID();

    await prisma.$executeRaw`
      INSERT INTO "RateLimitRecord" ("id", "key", "attempts", "windowStart", "updatedAt")
      VALUES (${id}, ${key}, 1, ${now}, ${now})
      ON CONFLICT ("key") DO UPDATE
      SET 
        "attempts" = CASE 
          WHEN "RateLimitRecord"."windowStart" + (${windowMs} * interval '1 millisecond') < ${now} THEN 1
          ELSE "RateLimitRecord"."attempts" + 1
        END,
        "windowStart" = CASE 
          WHEN "RateLimitRecord"."windowStart" + (${windowMs} * interval '1 millisecond') < ${now} THEN ${now}
          ELSE "RateLimitRecord"."windowStart"
        END,
        "updatedAt" = ${now};
    `;
  }

  /**
   * Resets rate limit records for a given key after successful authentication/unlock.
   */
  static async resetRateLimit(key: string): Promise<void> {
    await prisma.rateLimitRecord.deleteMany({
      where: { key },
    });
  }

  /**
   * Cleans up expired rate limit records past their retention window.
   * Can be invoked by scheduled maintenance workers or periodic crons.
   */
  static async cleanupExpiredRecords(windowMs = this.DEFAULT_WINDOW_MS): Promise<number> {
    const cutoff = new Date(Date.now() - windowMs);
    const result = await prisma.rateLimitRecord.deleteMany({
      where: {
        windowStart: {
          lt: cutoff,
        },
      },
    });
    return result.count;
  }
}
