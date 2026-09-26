import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, Eye, ArrowRight, ShieldCheck } from "lucide-react";

interface NoteSummary {
  id: string;
  title: string;
  createdAt: string | Date;
  activeLinksCount: number;
  totalViews: number;
}

interface NoteListProps {
  notes: NoteSummary[];
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <CardTitle className="text-lg">No Notes Created Yet</CardTitle>
        <CardDescription className="max-w-sm mx-auto mt-1 mb-6">
          Create your first confidential note, configure expiration, and generate a secure share link.
        </CardDescription>
        <Link href="/notes/new">
          <Button variant="primary" className="gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>Create First Note</span>
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-slate-200">Your Encrypted Notes</h2>
        <Link href="/notes/new">
          <Button variant="primary" size="sm" className="gap-1.5">
            <PlusCircle className="w-4 h-4" />
            <span>New Note</span>
          </Button>
        </Link>
      </div>

      <div className="grid gap-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-5 bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
          >
            <div className="space-y-1">
              <Link
                href={`/notes/${note.id}`}
                className="font-semibold text-slate-100 hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                <span>{note.title}</span>
              </Link>
              <div className="text-xs text-slate-400 flex items-center gap-4">
                <span>Created {new Date(note.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <strong>{note.totalViews}</strong> total views
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <strong>{note.activeLinksCount}</strong> active link{note.activeLinksCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Link href={`/notes/${note.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
