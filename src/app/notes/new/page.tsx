import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { Navbar } from "@/components/layout/navbar";
import { NoteForm } from "@/components/notes/note-form";

export default async function NewNotePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <>
      <Navbar user={session.user} />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <NoteForm />
      </main>
    </>
  );
}
