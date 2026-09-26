import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { NoteService } from "@/server/services/note.service";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Authentication required.", 401);
    }

    const { token } = await params;
    const link = await NoteService.revokeShareLink(session.user.id, token);

    if (!link) {
      return apiError("Share link not found.", 404);
    }

    return apiSuccess({
      success: true,
      message: "Share link has been successfully revoked.",
    });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return apiError("You do not have permission to revoke this share link.", 403);
    }
    return apiError("Failed to revoke share link.", 500);
  }
}
