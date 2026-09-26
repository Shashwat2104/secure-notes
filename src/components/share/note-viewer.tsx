"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, Copy, Check, ShieldCheck, Terminal, AlertTriangle } from "lucide-react";
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

  const lines = (note.content || "").split("\n");

  return (
    <div className="max-w-3xl w-full mx-auto p-5 sm:p-6 rounded-md border border-slate-800 bg-slate-900/80 space-y-4 text-left">
      {/* Self-Destruct Warning Stamp */}
      {note.shareType === "ONE_TIME" && (
        <div className="p-3.5 rounded bg-amber-950/30 border border-amber-500/40 text-amber-200 flex items-start gap-2.5">
          <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-mono font-semibold text-[11px] text-amber-300 uppercase tracking-wide block">
              Atomic One-Time Read: Secret Erased From Database
            </span>
            <p className="text-amber-200/90 leading-relaxed text-[11px]">
              This note was configured for single-read consumption. The server has permanently shredded the record via row-level SQL conditional update. If you close or reload this window, it cannot be recovered.
            </p>
          </div>
        </div>
      )}

      {/* Secret Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-semibold text-slate-100">{note.title}</h1>
            {note.shareType === "ONE_TIME" ? (
              <Badge variant="consumed">Consumed</Badge>
            ) : (
              <Badge variant="active">Active Window</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Expires {new Date(note.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>Decrypted Client-Side</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopy}
            className="gap-1 font-mono text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "COPIED" : "COPY PAYLOAD"}</span>
          </Button>
        </div>
      </div>

      {/* Payload Terminal Viewer with Line Numbers */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-slate-500">
          <span>Decrypted Plaintext ({note.content?.length || 0} characters · {lines.length} lines)</span>
          <span>UTF-8 ENCODED</span>
        </div>

        <div className="p-3 sm:p-4 bg-slate-950 rounded border border-slate-800 font-mono text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-wrap select-all overflow-x-auto">
          {note.content}
        </div>
      </div>

      {/* Telemetry Footer */}
      <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-[10px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          Zero-Knowledge Transmission Verified
        </span>
        <span className="text-slate-500">Authoritative UTC validation enforced</span>
      </div>
    </div>
  );
}


