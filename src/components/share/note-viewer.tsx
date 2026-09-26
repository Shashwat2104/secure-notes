"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Clock, Copy, Check, ShieldCheck, AlertCircle } from "lucide-react";
import { SharedNoteResponse } from "@/types";

interface NoteViewerProps {
  note: SharedNoteResponse;
}

export function NoteViewer({ note }: NoteViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (note.content) {
      navigator.clipboard.writeText(note.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="max-w-3xl w-full mx-auto shadow-2xl">
      {note.shareType === "ONE_TIME" && (
        <div className="mb-6 p-4 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-3">
          <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-sm text-amber-300 block">
              One-Time Note Self-Destructed
            </span>
            <p className="opacity-90 leading-relaxed">
              This note was configured for one-time access and has been permanently consumed.
              If you refresh or close this window, it cannot be accessed again.
            </p>
          </div>
        </div>
      )}

      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl text-slate-100">{note.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              className="gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy Content"}</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Expires: {new Date(note.expiresAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>End-to-End Encrypted Access</span>
          </div>
        </div>
      </CardHeader>

      <div className="space-y-4">
        <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 font-mono text-sm text-slate-200 leading-relaxed whitespace-pre-wrap select-all">
          {note.content}
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
          <span>Transmitted securely via SecureNotes</span>
          <span className="text-slate-500">Authoritative UTC validation</span>
        </div>
      </div>
    </Card>
  );
}
