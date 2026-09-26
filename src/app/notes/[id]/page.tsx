import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { Navbar } from "@/components/layout/navbar";
import { NoteDetail } from "@/components/notes/note-detail";
import { NoteService } from "@/server/services/note.service";

export default async function NoteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const { created } = await searchParams;

  try {
    const note = await NoteService.getNoteDetails(session.user.id, id);
    if (!note) {
      notFound();
    }

    return (
      <>
        <Navbar user={session.user} />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10">
          <NoteDetail note={note} initialCreated={created === "true"} />
        </main>
      </>
    );
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      notFound();
    }
    throw error;
  }
}
