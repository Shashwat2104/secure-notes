import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { Navbar } from "@/components/layout/navbar";
import { NoteList } from "@/components/notes/note-list";
import { NoteService } from "@/server/services/note.service";

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const notes = await NoteService.listUserNotes(session.user.id);

  return (
    <>
      <Navbar user={session.user} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10">
        <NoteList notes={notes} />
      </main>
    </>
  );
}
