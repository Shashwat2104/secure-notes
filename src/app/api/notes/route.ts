import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { createNoteSchema } from "@/lib/validation/note.schema";
import { NoteService } from "@/server/services/note.service";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Authentication required", 401);
    }

    const json = await req.json();
    const result = createNoteSchema.safeParse(json);

    if (!result.success) {
      return apiError("Validation Error", 400, result.error.errors);
    }

    const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "");
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host;
    const origin = process.env.NEXT_APP_URL || process.env.NEXT_PUBLIC_APP_URL || (host ? `${proto}://${host}` : req.nextUrl.origin) || "http://localhost:3000";
    const note = await NoteService.createNote(session.user.id, result.data, origin);

    return apiSuccess(note, 201);
  } catch (error) {
    return apiError("Failed to create note", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Authentication required", 401);
    }

    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0", 10);
    const notes = await NoteService.listUserNotes(session.user.id, limit, offset);
    return apiSuccess({ notes });
  } catch (error) {
    return apiError("Failed to retrieve notes", 500);
  }
}
