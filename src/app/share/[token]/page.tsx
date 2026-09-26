"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { UnlockForm } from "@/components/share/unlock-form";
import { NoteViewer } from "@/components/share/note-viewer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import { SharedNoteResponse } from "@/types";

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteData, setNoteData] = useState<SharedNoteResponse | null>(null);

  useEffect(() => {
    async function fetchShareInfo() {
      try {
        const res = await fetch(`/api/share/${token}`, {
          cache: "no-store",
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "This share link is unavailable.");
          return;
        }

        setNoteData(data);
      } catch (err) {
        setError("This share link is unavailable.");
      } finally {
        setLoading(false);
      }
    }

    fetchShareInfo();
  }, [token]);

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-100 hover:text-blue-400 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <span>SecureNotes</span>
          </Link>
          <span className="text-xs text-slate-500">
            Encrypted End-to-End Share
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">Decrypting share token...</p>
          </div>
        )}

        {!loading && error && (
          <Card className="max-w-md w-full mx-auto text-center py-8">
            <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-800 text-red-400 mx-auto flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg text-red-200">Share Link Unavailable</CardTitle>
            <CardDescription className="max-w-xs mx-auto mt-2 mb-6">
              This note may have expired, been revoked by its owner, already been consumed, or the token is invalid.
            </CardDescription>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Return to SecureNotes</span>
              </Button>
            </Link>
          </Card>
        )}

        {!loading && !error && noteData && (
          <>
            {noteData.isProtected ? (
              <UnlockForm
                token={token}
                onUnlocked={(unlockedNote) => setNoteData(unlockedNote)}
              />
            ) : (
              <NoteViewer note={noteData} />
            )}
          </>
        )}
      </main>
    </>
  );
}
