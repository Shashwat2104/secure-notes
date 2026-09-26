import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { NoteService } from "@/server/services/note.service";
import { ShareService } from "@/server/services/share.service";
import { AuthService } from "@/server/services/auth.service";

describe("Password-Protected Share Flow with Brute-Force Defense", () => {
  let userId: string;

  beforeAll(async () => {
    const user = await AuthService.registerUser({
      name: "Password Share Tester",
      email: `pwd_tester_${Date.now()}@example.com`,
      password: "TestPassword123!",
      confirmPassword: "TestPassword123!",
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: userId },
    });
  });

  it("requires access key, does not leak content before unlock, rejects wrong key without incrementing views, throttles after 5 failed attempts, and unlocks with correct key", async () => {
    const futureExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const created = await NoteService.createNote(
      userId,
      {
        title: "Protected Database Password",
        content: "POSTGRES_PROD_PASS=99#xyz@db",
        expiresAt: futureExpiry,
        shareType: "ONE_TIME",
        accessType: "PASSWORD_PROTECTED",
      },
      "http://localhost:3000"
    );

    expect(created.shareLink.accessKey).toBeDefined();
    const rawKey = created.shareLink.accessKey!;
    const rawToken = created.shareLink.shareUrl.split("/share/")[1];

    // 1. Initial access returns challenge without note content or title
    const initialCheck = await ShareService.accessShareLink(rawToken);
    expect(initialCheck.status).toBe("CHALLENGE_REQUIRED");
    if (initialCheck.status === "CHALLENGE_REQUIRED") {
      expect(initialCheck.isProtected).toBe(true);
      expect((initialCheck as any).content).toBeUndefined();
      expect((initialCheck as any).title).toBeUndefined();
    }

    const testIp = `192.168.1.${Math.floor(Math.random() * 200 + 10)}`;

    // 2. Submit wrong key
    const wrongAttempt = await ShareService.unlockShareLink(rawToken, "WRONG-KEY-1234", testIp);
    expect(wrongAttempt.status).toBe("INVALID_KEY");

    // Verify view count is 0 and link is NOT consumed
    const linkAfterWrong = await prisma.shareLink.findUnique({
      where: { id: created.shareLink.id },
    });
    expect(linkAfterWrong?.viewCount).toBe(0);
    expect(linkAfterWrong?.consumedAt).toBeNull();

    // 3. Brute-force protection: Submit 4 more failed attempts (total 5)
    for (let i = 0; i < 4; i++) {
      await ShareService.unlockShareLink(rawToken, `BAD-KEY-${i}`, testIp);
    }

    // 6th attempt must be RATE_LIMITED
    const throttledAttempt = await ShareService.unlockShareLink(rawToken, rawKey, testIp);
    expect(throttledAttempt.status).toBe("RATE_LIMITED");
    if (throttledAttempt.status === "RATE_LIMITED") {
      expect(throttledAttempt.retryAfter).toBeGreaterThan(0);
    }

    // View count still 0
    const linkAfterThrottle = await prisma.shareLink.findUnique({
      where: { id: created.shareLink.id },
    });
    expect(linkAfterThrottle?.viewCount).toBe(0);
    expect(linkAfterThrottle?.consumedAt).toBeNull();

    // 4. Legitimate request from a different unthrottled IP with correct key
    const legitimateIp = "10.0.0.99";
    const successUnlock = await ShareService.unlockShareLink(rawToken, rawKey, legitimateIp);
    expect(successUnlock.status).toBe("SUCCESS");
    if (successUnlock.status === "SUCCESS") {
      expect(successUnlock.title).toBe("Protected Database Password");
      expect(successUnlock.content).toBe("POSTGRES_PROD_PASS=99#xyz@db");
    }

    // 5. Verify ONE_TIME link is now consumed and view count is 1
    const finalLink = await prisma.shareLink.findUnique({
      where: { id: created.shareLink.id },
    });
    expect(finalLink?.viewCount).toBe(1);
    expect(finalLink?.consumedAt).not.toBeNull();

    // 6. Second unlock attempt must fail because link was consumed
    const secondUnlock = await ShareService.unlockShareLink(rawToken, rawKey, "10.0.0.100");
    expect(secondUnlock.status).toBe("UNAVAILABLE");
  });
});
