import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { NoteService } from "@/server/services/note.service";
import { ShareService } from "@/server/services/share.service";
import { AuthService } from "@/server/services/auth.service";

describe("Note Management & Authorization Isolation", () => {
  let userA: { id: string; email: string };
  let userB: { id: string; email: string };

  beforeAll(async () => {
    userA = await AuthService.registerUser({
      name: "Owner A",
      email: `owner_a_${Date.now()}@example.com`,
      password: "Password123!",
      confirmPassword: "Password123!",
    });

    userB = await AuthService.registerUser({
      name: "Owner B",
      email: `owner_b_${Date.now()}@example.com`,
      password: "Password123!",
      confirmPassword: "Password123!",
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [userA.id, userB.id] } },
    });
  });

  it("enforces owner isolation on note inspection", async () => {
    const noteA = await NoteService.createNote(
      userA.id,
      {
        title: "User A Confidential",
        content: "Top secret strategy document.",
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        shareType: "TIME_BASED",
        accessType: "PUBLIC",
      },
      "http://localhost:3000"
    );

    // User A can access own note
    const details = await NoteService.getNoteDetails(userA.id, noteA.id);
    expect(details?.id).toBe(noteA.id);
    expect(details?.title).toBe("User A Confidential");
    expect(details?.shareLinks).toHaveLength(1);
    expect(details?.shareLinks[0].status).toBe("ACTIVE");

    // User B attempting to view User A's note must be rejected with FORBIDDEN
    await expect(NoteService.getNoteDetails(userB.id, noteA.id)).rejects.toThrow(
      "FORBIDDEN"
    );
  });

  it("allows owner to revoke share link and rejects unauthorized revocation", async () => {
    const noteA = await NoteService.createNote(
      userA.id,
      {
        title: "Revocable Note",
        content: "Temporary key before rotation.",
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        shareType: "TIME_BASED",
        accessType: "PUBLIC",
      },
      "http://localhost:3000"
    );

    const rawToken = noteA.shareLink.shareUrl.split("/share/")[1];

    // Verify link works initially
    const preCheck = await ShareService.accessShareLink(rawToken);
    expect(preCheck.status).toBe("SUCCESS");

    // Non-owner User B attempts to revoke -> FORBIDDEN
    await expect(
      NoteService.revokeShareLink(userB.id, noteA.shareLink.id)
    ).rejects.toThrow("FORBIDDEN");

    // Owner User A revokes the link
    const revoked = await NoteService.revokeShareLink(userA.id, noteA.shareLink.id);
    expect(revoked?.revokedAt).not.toBeNull();

    // Subsequent access attempts to revoked link must fail
    const postCheck = await ShareService.accessShareLink(rawToken);
    expect(postCheck.status).toBe("UNAVAILABLE");

    // Details page reflects REVOKED status
    const detailsAfter = await NoteService.getNoteDetails(userA.id, noteA.id);
    expect(detailsAfter?.shareLinks[0].status).toBe("REVOKED");
  });
});
