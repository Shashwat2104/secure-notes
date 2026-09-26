import { NextRequest } from "next/server";
import { unlockShareSchema } from "@/lib/validation/share.schema";
import { ShareService } from "@/server/services/share.service";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return apiError("This share link is unavailable.", 404);
    }

    const json = await req.json();
    const parsed = unlockShareSchema.safeParse(json);
    if (!parsed.success) {
      return apiError("Invalid access key format.", 400);
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const result = await ShareService.unlockShareLink(
      token,
      parsed.data.accessKey,
      clientIp
    );

    if (result.status === "RATE_LIMITED") {
      const retryAfter = result.retryAfter || 900;
      return apiError(
        "Too many failed attempts. Please try again later.",
        429,
        undefined,
        { "Retry-After": String(retryAfter) }
      );
    }

    if (result.status === "INVALID_KEY") {
      return apiError("Invalid access key.", 401);
    }

    if (result.status === "UNAVAILABLE") {
      return apiError("This share link is unavailable.", 404);
    }

    return apiSuccess({
      isProtected: false,
      title: result.title,
      content: result.content,
      shareType: result.shareType,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    return apiError("Failed to unlock note.", 500);
  }
}
