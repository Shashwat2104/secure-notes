import { prisma } from "@/lib/db/prisma";
import { generateShareToken, hashShareToken } from "@/lib/security/tokens";
import { generateAccessKey } from "@/lib/security/access-key";
import { hashSecret } from "@/lib/security/hashing";
import { CreateNoteInput } from "@/lib/validation/note.schema";

export class NoteService {
  /**
   * Creates a note and its initial share link.
   * Generates a CSPRNG token (hashed at rest) and dynamic access key if protected.
   */
  static async createNote(userId: string, input: CreateNoteInput, baseUrl: string) {
    const { rawToken, tokenHash } = generateShareToken();
    let rawAccessKey: string | undefined = undefined;
    let accessKeyHash: string | null = null;

    if (input.accessType === "PASSWORD_PROTECTED") {
      rawAccessKey = generateAccessKey();
      accessKeyHash = await hashSecret(rawAccessKey);
    }

    const result = await prisma.$transaction(async (tx) => {
      const note = await tx.note.create({
        data: {
          userId,
          title: input.title,
          content: input.content,
        },
      });

      const shareLink = await tx.shareLink.create({
        data: {
          noteId: note.id,
          tokenHash,
          shareType: input.shareType,
          accessType: input.accessType,
          accessKeyHash,
          expiresAt: new Date(input.expiresAt),
        },
      });

      return { note, shareLink };
    });

    const shareUrl = `${baseUrl}/share/${rawToken}`;

    return {
      id: result.note.id,
      title: result.note.title,
      content: result.note.content,
      createdAt: result.note.createdAt,
      shareLink: {
        id: result.shareLink.id,
        shareUrl,
        shareType: result.shareLink.shareType,
        accessType: result.shareLink.accessType,
        accessKey: rawAccessKey, // ONLY returned upon creation!
        expiresAt: result.shareLink.expiresAt,
        createdAt: result.shareLink.createdAt,
      },
    };
  }

  /**
   * Retrieves note details for the authenticated owner.
   * Enforces strict authorization (403 Forbidden for non-owners).
   */
  static async getNoteDetails(userId: string, noteId: string, baseUrl?: string) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        shareLinks: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!note) {
      return null;
    }

    if (note.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    const now = new Date();

    return {
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      shareLinks: note.shareLinks.map((link) => {
        let status: "ACTIVE" | "CONSUMED" | "EXPIRED" | "REVOKED" = "ACTIVE";
        if (link.revokedAt) {
          status = "REVOKED";
        } else if (link.consumedAt) {
          status = "CONSUMED";
        } else if (now >= link.expiresAt) {
          status = "EXPIRED";
        }

        return {
          id: link.id,
          shareType: link.shareType,
          accessType: link.accessType,
          status,
          expiresAt: link.expiresAt,
          consumedAt: link.consumedAt,
          revokedAt: link.revokedAt,
          viewCount: link.viewCount,
          createdAt: link.createdAt,
        };
      }),
    };
  }

  /**
   * Lists notes owned by the authenticated user with bounded pagination.
   */
  static async listUserNotes(userId: string, limit = 50, offset = 0) {
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safeOffset = Math.max(0, offset);

    const notes = await prisma.note.findMany({
      where: { userId },
      take: safeLimit,
      skip: safeOffset,
      include: {
        shareLinks: {
          select: {
            id: true,
            expiresAt: true,
            consumedAt: true,
            revokedAt: true,
            viewCount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();

    return notes.map((n) => {
      const activeLinks = n.shareLinks.filter(
        (l) => !l.revokedAt && !l.consumedAt && l.expiresAt > now
      ).length;
      const totalViews = n.shareLinks.reduce((acc, l) => acc + l.viewCount, 0);

      return {
        id: n.id,
        title: n.title,
        createdAt: n.createdAt,
        activeLinksCount: activeLinks,
        totalViews,
      };
    });
  }

  /**
   * Revokes an active share link if owned by the user.
   */
  static async revokeShareLink(userId: string, linkIdOrToken: string) {
    const tokenHash = hashShareToken(linkIdOrToken);

    // Find link by id or tokenHash
    const link = await prisma.shareLink.findFirst({
      where: {
        OR: [{ id: linkIdOrToken }, { tokenHash }],
      },
      include: { note: true },
    });

    if (!link) {
      return null;
    }

    if (link.note.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    if (link.revokedAt) {
      return link; // Already revoked
    }

    return await prisma.shareLink.update({
      where: { id: link.id },
      data: { revokedAt: new Date() },
    });
  }
}
