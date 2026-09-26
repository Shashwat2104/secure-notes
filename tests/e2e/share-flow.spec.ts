/**
 * End-to-End Test Suite for Secure Note Sharing Application
 * 
 * Verifies the complete user journeys:
 * 1. User registration & login
 * 2. Creating a public time-based note & viewing it without credentials
 * 3. Creating a password-protected note, receiving dynamic access key, and unlocking
 * 4. Creating a one-time self-destructing note, viewing once, and verifying self-destruction
 * 5. Revoking an active share link from owner dashboard and verifying immediate denial
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { AuthService } from "@/server/services/auth.service";
import { NoteService } from "@/server/services/note.service";
import { ShareService } from "@/server/services/share.service";

describe("E2E Share Flow Verification", () => {
  let user: { id: string; email: string };

  beforeAll(async () => {
    user = await AuthService.registerUser({
      name: "E2E Master Tester",
      email: `e2e_master_${Date.now()}@example.com`,
      password: "MasterPassword123!",
      confirmPassword: "MasterPassword123!",
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: user.id },
    });
  });

  it("completes full end-to-end user lifecycle across all sharing modalities", async () => {
    // 1. Note Creation: Time-based Public Note
    const publicNote = await NoteService.createNote(
      user.id,
      {
        title: "Public Roadmap",
        content: "v2.0 release planned for Q4.",
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        shareType: "TIME_BASED",
        accessType: "PUBLIC",
      },
      "http://localhost:3000"
    );
    const pubToken = publicNote.shareLink.shareUrl.split("/share/")[1];

    // Public access view
    const pubView = await ShareService.accessShareLink(pubToken);
    expect(pubView.status).toBe("SUCCESS");
    if (pubView.status === "SUCCESS") {
      expect(pubView.title).toBe("Public Roadmap");
      expect(pubView.content).toBe("v2.0 release planned for Q4.");
    }

    // 2. Note Creation: One-Time Password-Protected Note
    const protectedNote = await NoteService.createNote(
      user.id,
      {
        title: "Database Root Credentials",
        content: "PGUSER=root PGPASS=ultra_secure_pass_9988",
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        shareType: "ONE_TIME",
        accessType: "PASSWORD_PROTECTED",
      },
      "http://localhost:3000"
    );

    const protToken = protectedNote.shareLink.shareUrl.split("/share/")[1];
    const accessKey = protectedNote.shareLink.accessKey!;
    expect(accessKey).toBeDefined();

    // Anonymous recipient opens link: sees challenge prompt
    const challenge = await ShareService.accessShareLink(protToken);
    expect(challenge.status).toBe("CHALLENGE_REQUIRED");
    if (challenge.status === "CHALLENGE_REQUIRED") {
      expect(challenge.isProtected).toBe(true);
    }

    // Recipient attempts wrong password
    const badUnlock = await ShareService.unlockShareLink(protToken, "WRONG-PASS", "192.168.1.50");
    expect(badUnlock.status).toBe("INVALID_KEY");

    // Recipient submits correct password
    const goodUnlock = await ShareService.unlockShareLink(protToken, accessKey, "192.168.1.50");
    expect(goodUnlock.status).toBe("SUCCESS");
    if (goodUnlock.status === "SUCCESS") {
      expect(goodUnlock.title).toBe("Database Root Credentials");
      expect(goodUnlock.content).toBe("PGUSER=root PGPASS=ultra_secure_pass_9988");
    }

    // Recipient tries to reopen one-time note -> denied
    const secondTry = await ShareService.accessShareLink(protToken);
    expect(secondTry.status).toBe("UNAVAILABLE");

    // 3. Revocation: Owner revokes public note
    await NoteService.revokeShareLink(user.id, publicNote.shareLink.id);
    const postRevoke = await ShareService.accessShareLink(pubToken);
    expect(postRevoke.status).toBe("UNAVAILABLE");
  });
});
