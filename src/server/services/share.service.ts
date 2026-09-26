import { prisma } from "@/lib/db/prisma";
import { hashShareToken } from "@/lib/security/tokens";
import { verifySecret } from "@/lib/security/hashing";
import { decryptPayload } from "@/lib/security/encryption";
import { RateLimitService } from "./rate-limit.service";
import { normalizeAccessKey } from "@/lib/security/access-key";

export type ShareAccessResult =
  | {
      status: "SUCCESS";
      isProtected: false;
      title: string;
      content: string;
      shareType: "ONE_TIME" | "TIME_BASED";
      expiresAt: Date;
    }
  | {
      status: "CHALLENGE_REQUIRED";
      isProtected: true;
      accessType: "PASSWORD_PROTECTED";
      shareType: "ONE_TIME" | "TIME_BASED";
      expiresAt: Date;
    }
  | {
      status: "UNAVAILABLE";
    };

export type UnlockResult =
  | {
      status: "SUCCESS";
      title: string;
      content: string;
      shareType: "ONE_TIME" | "TIME_BASED";
      expiresAt: Date;
    }
  | {
      status: "INVALID_KEY";
    }
  | {
      status: "RATE_LIMITED";
      retryAfter?: number;
    }
  | {
      status: "UNAVAILABLE";
    };

export class ShareService {
  /**
   * Evaluates a raw share token.
   * - Public notes: Atomically claims (if ONE_TIME) and returns note content.
   * - Password protected: Returns challenge metadata without note title or content.
   * - Expired / Revoked / Consumed / Invalid: Returns UNAVAILABLE.
   */
  static async accessShareLink(rawToken: string): Promise<ShareAccessResult> {
    const tokenHash = hashShareToken(rawToken);
    const now = new Date();

    const link = await prisma.shareLink.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        noteId: true,
        shareType: true,
        accessType: true,
        expiresAt: true,
        consumedAt: true,
        revokedAt: true,
      },
    });

    if (!link) {
      return { status: "UNAVAILABLE" };
    }

    // Check expiration, revocation, or previous consumption
    if (link.revokedAt || link.consumedAt || now >= link.expiresAt) {
      return { status: "UNAVAILABLE" };
    }

    // If password protected, require unlock challenge
    if (link.accessType === "PASSWORD_PROTECTED") {
      return {
        status: "CHALLENGE_REQUIRED",
        isProtected: true,
        accessType: "PASSWORD_PROTECTED",
        shareType: link.shareType,
        expiresAt: link.expiresAt,
      };
    }

    // Access is PUBLIC
    if (link.shareType === "ONE_TIME") {
      // Atomic conditional update guaranteeing exactly one winner under arbitrary concurrency
      const claimed = await prisma.$executeRaw`
        UPDATE "ShareLink"
        SET "consumedAt" = (NOW() AT TIME ZONE 'UTC'),
            "viewCount" = "viewCount" + 1,
            "updatedAt" = (NOW() AT TIME ZONE 'UTC')
        WHERE "id" = ${link.id}
          AND "consumedAt" IS NULL
          AND "revokedAt" IS NULL
          AND "expiresAt" > (NOW() AT TIME ZONE 'UTC');
      `;

      if (claimed === 0) {
        return { status: "UNAVAILABLE" };
      }
    } else {
      // Atomic view count increment for time-based access
      await prisma.shareLink.update({
        where: { id: link.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    // Defer note content retrieval until AFTER authorization & atomic claim succeed
    const note = await prisma.note.findUnique({
      where: { id: link.noteId },
      select: { title: true, content: true },
    });

    if (!note) {
      return { status: "UNAVAILABLE" };
    }

    return {
      status: "SUCCESS",
      isProtected: false,
      title: note.title,
      content: decryptPayload(note.content),
      shareType: link.shareType,
      expiresAt: link.expiresAt,
    };
  }

  /**
   * Unlocks a password-protected note.
   * - Verifies rate limits for IP + shareLinkId.
   * - Verifies access key against Argon2id hash.
   * - If valid & ONE_TIME: Atomically consumes and increments view count.
   * - If valid & TIME_BASED: Atomically increments view count.
   * - If invalid: Records failed attempt, returns generic error without disclosing content.
   */
  static async unlockShareLink(
    rawToken: string,
    rawKey: string,
    clientIp: string
  ): Promise<UnlockResult> {
    const tokenHash = hashShareToken(rawToken);
    const now = new Date();

    const link = await prisma.shareLink.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        noteId: true,
        shareType: true,
        accessType: true,
        accessKeyHash: true,
        expiresAt: true,
        consumedAt: true,
        revokedAt: true,
      },
    });

    if (!link) {
      return { status: "UNAVAILABLE" };
    }

    if (link.revokedAt || link.consumedAt || now >= link.expiresAt) {
      return { status: "UNAVAILABLE" };
    }

    if (link.accessType !== "PASSWORD_PROTECTED" || !link.accessKeyHash) {
      return { status: "UNAVAILABLE" };
    }

    // Rate limit check keyed by IP and ShareLink ID
    const rateLimitKey = `${clientIp}:${link.id}`;
    const rateCheck = await RateLimitService.checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return {
        status: "RATE_LIMITED",
        retryAfter: rateCheck.retryAfter,
      };
    }

    // Verify access key
    const normalizedKey = normalizeAccessKey(rawKey);
    const isValid =
      (await verifySecret(link.accessKeyHash, rawKey)) ||
      (await verifySecret(link.accessKeyHash, normalizedKey));

    if (!isValid) {
      await RateLimitService.recordFailedAttempt(rateLimitKey);
      return { status: "INVALID_KEY" };
    }

    // Key is valid - reset failed attempt counter
    await RateLimitService.resetRateLimit(rateLimitKey);

    if (link.shareType === "ONE_TIME") {
      // Atomic conditional update
      const claimed = await prisma.$executeRaw`
        UPDATE "ShareLink"
        SET "consumedAt" = (NOW() AT TIME ZONE 'UTC'),
            "viewCount" = "viewCount" + 1,
            "updatedAt" = (NOW() AT TIME ZONE 'UTC')
        WHERE "id" = ${link.id}
          AND "consumedAt" IS NULL
          AND "revokedAt" IS NULL
          AND "expiresAt" > (NOW() AT TIME ZONE 'UTC');
      `;

      if (claimed === 0) {
        return { status: "UNAVAILABLE" };
      }
    } else {
      // Atomic increment for time-based links
      await prisma.shareLink.update({
        where: { id: link.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    // Defer note content retrieval until AFTER authorization & atomic claim succeed
    const note = await prisma.note.findUnique({
      where: { id: link.noteId },
      select: { title: true, content: true },
    });

    if (!note) {
      return { status: "UNAVAILABLE" };
    }

    return {
      status: "SUCCESS",
      title: note.title,
      content: decryptPayload(note.content),
      shareType: link.shareType,
      expiresAt: link.expiresAt,
    };
  }
}
