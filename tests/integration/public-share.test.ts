import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { NoteService } from "@/server/services/note.service";
import { ShareService } from "@/server/services/share.service";
import { AuthService } from "@/server/services/auth.service";

describe("Public Share Flow (Time-Based)", () => {
  let userId: string;

  beforeAll(async () => {
    // Create test user
    const user = await AuthService.registerUser({
      name: "Public Share Tester",
      email: `public_tester_${Date.now()}@example.com`,
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

  it("creates a public time-based note, allows access, increments view count, and denies access after expiration", async () => {
    const futureExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour future

    const created = await NoteService.createNote(
      userId,
      {
        title: "Public Announcement",
        content: "Server maintenance tonight at midnight UTC.",
        expiresAt: futureExpiry,
        shareType: "TIME_BASED",
        accessType: "PUBLIC",
      },
      "http://localhost:3000"
    );

    expect(created.id).toBeDefined();
    expect(created.shareLink.shareUrl).toBeDefined();

    // Extract raw token from URL
    const rawToken = created.shareLink.shareUrl.split("/share/")[1];

    // First access
    const access1 = await ShareService.accessShareLink(rawToken);
    expect(access1.status).toBe("SUCCESS");
    if (access1.status === "SUCCESS") {
      expect(access1.title).toBe("Public Announcement");
      expect(access1.content).toBe("Server maintenance tonight at midnight UTC.");
      expect(access1.shareType).toBe("TIME_BASED");
    }

    // Verify view count is 1
    const linkAfter1 = await prisma.shareLink.findUnique({
      where: { id: created.shareLink.id },
    });
    expect(linkAfter1?.viewCount).toBe(1);

    // Second access (time-based allows multiple views)
    const access2 = await ShareService.accessShareLink(rawToken);
    expect(access2.status).toBe("SUCCESS");

    // Verify view count incremented to 2
    const linkAfter2 = await prisma.shareLink.findUnique({
      where: { id: created.shareLink.id },
    });
    expect(linkAfter2?.viewCount).toBe(2);

    // Simulate expiration by backdating expiresAt in DB
    await prisma.shareLink.update({
      where: { id: created.shareLink.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    // Access after expiration must be denied
    const accessExpired = await ShareService.accessShareLink(rawToken);
    expect(accessExpired.status).toBe("UNAVAILABLE");

    // View count must NOT increment on expired access
    const linkAfterExpired = await prisma.shareLink.findUnique({
      where: { id: created.shareLink.id },
    });
    expect(linkAfterExpired?.viewCount).toBe(2);
  });

  it("returns UNAVAILABLE for non-existent tokens", async () => {
    const result = await ShareService.accessShareLink("non-existent-random-token-xyz");
    expect(result.status).toBe("UNAVAILABLE");
  });
});
