import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { NoteService } from "@/server/services/note.service";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Authentication required", 401);
    }

    const { id } = await params;
    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const note = await NoteService.getNoteDetails(session.user.id, id, origin);

    if (!note) {
      return apiError("Note not found", 404);
    }

    return apiSuccess(note);
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return apiError("You do not have permission to view this note", 403);
    }
    return apiError("Failed to retrieve note details", 500);
  }
}
