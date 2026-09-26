import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { NoteService } from "@/server/services/note.service";
import { ShareService } from "@/server/services/share.service";
import { AuthService } from "@/server/services/auth.service";
import { RateLimitService } from "@/server/services/rate-limit.service";

describe("Mandatory Concurrency Race-Condition Test (One-Time Links)", () => {
  let userId: string;

  beforeAll(async () => {
    const user = await AuthService.registerUser({
      name: "Concurrency Tester",
      email: `concurrency_tester_${Date.now()}@example.com`,
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

  it("handles 20 simultaneous concurrent requests against a one-time link: exactly 1 succeeds, 19 fail, viewCount = 1, consumedAt != null", async () => {
    const futureExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Create a ONE_TIME public note
    const created = await NoteService.createNote(
      userId,
      {
        title: "Self-Destructing Secret Credentials",
        content: "API_SECRET=prod_super_secret_99881122",
        expiresAt: futureExpiry,
        shareType: "ONE_TIME",
        accessType: "PUBLIC",
      },
      "http://localhost:3000"
    );

    const rawToken = created.shareLink.shareUrl.split("/share/")[1];

    // Fire 20 concurrent requests simultaneously using Promise.all
    const CONCURRENCY_COUNT = 20;
    const requestPromises = Array.from({ length: CONCURRENCY_COUNT }, () =>
      ShareService.accessShareLink(rawToken)
    );

    const results = await Promise.all(requestPromises);

    // Count successful and failed responses
    const successfulResponses = results.filter((r) => r.status === "SUCCESS");
    const failedResponses = results.filter((r) => r.status === "UNAVAILABLE");

    // Critical Invariant Assertions:
    expect(successfulResponses).toHaveLength(1);
    expect(failedResponses).toHaveLength(19);

    // Verify the single successful winner received content
    const winner = successfulResponses[0];
    if (winner.status === "SUCCESS") {
      expect(winner.title).toBe("Self-Destructing Secret Credentials");
      expect(winner.content).toBe("API_SECRET=prod_super_secret_99881122");
    }

    // Verify authoritative database state
    const linkInDb = await prisma.shareLink.findUnique({
      where: { id: created.shareLink.id },
    });

    expect(linkInDb).toBeDefined();
    expect(linkInDb?.consumedAt).not.toBeNull();
    expect(linkInDb?.viewCount).toBe(1);

    // Any subsequent requests after the race condition must also be rejected
    const postRaceAttempt = await ShareService.accessShareLink(rawToken);
    expect(postRaceAttempt.status).toBe("UNAVAILABLE");

    const finalDbState = await prisma.shareLink.findUnique({
      where: { id: created.shareLink.id },
    });
    expect(finalDbState?.viewCount).toBe(1);
  });

  it("handles concurrent failed attempts safely without throwing P2002 unique constraint violations", async () => {
    const testKey = `test-ip-${Date.now()}:link-concurrency-test`;

    // Fire 10 concurrent failed attempts at the exact same millisecond
    const CONCURRENT_FAILURES = 10;
    const promises = Array.from({ length: CONCURRENT_FAILURES }, () =>
      RateLimitService.recordFailedAttempt(testKey)
    );

    // None should throw an unhandled unique constraint error
    await expect(Promise.all(promises)).resolves.not.toThrow();

    // Verify rate limit record in database
    const record = await prisma.rateLimitRecord.findUnique({
      where: { key: testKey },
    });

    expect(record).toBeDefined();
    expect(record?.attempts).toBe(CONCURRENT_FAILURES);

    // Clean up test record
    await prisma.rateLimitRecord.deleteMany({
      where: { key: testKey },
    });
  });
});

