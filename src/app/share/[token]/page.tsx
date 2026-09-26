"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { UnlockForm } from "@/components/share/unlock-form";
import { NoteViewer } from "@/components/share/note-viewer";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, ArrowLeft, Loader2, Lock } from "lucide-react";
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
      } catch {
        setError("This share link is unavailable.");
      } finally {
        setLoading(false);
      }
    }

    fetchShareInfo();
  }, [token]);

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-xs sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-sm sm:text-base text-slate-100 hover:text-emerald-400 transition-colors"
          >
            <div className="w-7 h-7 rounded-[4px] bg-slate-900 border border-slate-700/80 flex items-center justify-center text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold tracking-tight">SECURE<span className="text-emerald-400">_VAULT</span></span>
          </Link>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
            RECIPIENT PORTAL // E2EE
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {loading && (
          <div className="p-6 rounded-md bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400 max-w-sm w-full mx-auto text-center">
            <div className="w-8 h-8 rounded-[4px] bg-slate-950 border border-slate-700/80 flex items-center justify-center text-emerald-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold font-mono text-slate-200 uppercase">Resolving Token Nonce</p>
              <p className="text-[11px] text-slate-500 font-mono">Verifying UTC expiration and claim status...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="max-w-md w-full mx-auto text-center p-6 rounded-md border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="w-10 h-10 rounded-[4px] bg-rose-950/40 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-semibold font-mono text-slate-100 uppercase">Share Link Unavailable</h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                This note may have reached its UTC expiration limit, been manually revoked, consumed (one-time burn), or the token is invalid.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/">
                <Button variant="secondary" size="sm" className="gap-1.5 font-mono text-xs">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to SecureVault</span>
                </Button>
              </Link>
            </div>
          </div>
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

