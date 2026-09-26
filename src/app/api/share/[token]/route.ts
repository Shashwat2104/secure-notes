import { NextRequest } from "next/server";
import { ShareService } from "@/server/services/share.service";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token || token.trim().length === 0) {
      return apiError("This share link is unavailable.", 404);
    }

    const result = await ShareService.accessShareLink(token);

    if (result.status === "UNAVAILABLE") {
      return apiError("This share link is unavailable.", 404);
    }

    if (result.status === "CHALLENGE_REQUIRED") {
      return apiSuccess({
        isProtected: true,
        accessType: result.accessType,
        shareType: result.shareType,
        expiresAt: result.expiresAt,
      });
    }

    return apiSuccess({
      isProtected: false,
      title: result.title,
      content: result.content,
      shareType: result.shareType,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    return apiError("This share link is unavailable.", 500);
  }
}
