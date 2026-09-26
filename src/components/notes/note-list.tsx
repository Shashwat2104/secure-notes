"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Eye,
  ArrowRight,
  ShieldCheck,
  Search,
  Lock,
  Flame,
  Clock,
  Shield,
  Copy,
  Check,
  Terminal,
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "ACTIVE" | "VIEWED">("ALL");

  // Summary Metrics computed from actual note data
  const totalNotes = notes.length;
  const activeLinks = useMemo(
    () => notes.reduce((acc, n) => acc + (n.activeLinksCount || 0), 0),
    [notes]
  );
  const totalViews = useMemo(
    () => notes.reduce((acc, n) => acc + (n.totalViews || 0), 0),
    [notes]
  );

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      if (filterMode === "ACTIVE") return n.activeLinksCount > 0;
      if (filterMode === "VIEWED") return n.totalViews > 0;
      return true;
    });
  }, [notes, searchQuery, filterMode]);

  if (notes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="rounded-md border border-slate-800 bg-slate-900/60 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-[4px] bg-slate-950 border border-slate-700/80 flex items-center justify-center mx-auto text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-100">Cryptographic Vault Empty</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              No confidential notes or ephemeral dispatches found. Initialize your first encrypted payload with strict single-winner destruction and Argon2id access keys.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/notes/new">
              <Button variant="primary" size="md" className="gap-2">
                <Plus className="w-4 h-4" />
                <span>Initialize Encrypted Secret</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Cryptographic Guarantees Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-3.5 rounded-md bg-slate-900/40 border border-slate-800 space-y-1">
            <div className="text-[11px] font-mono text-amber-400 font-medium flex items-center gap-1.5 uppercase">
              <Flame className="w-3.5 h-3.5" />
              Atomic Single-Read
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Permanent erasure via row-level SQL conditional update upon first decryption.
            </p>
          </div>
          <div className="p-3.5 rounded-md bg-slate-900/40 border border-slate-800 space-y-1">
            <div className="text-[11px] font-mono text-emerald-400 font-medium flex items-center gap-1.5 uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              Argon2id Key Hashing
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Memory-hard key derivation prevents brute-force offline token derivation.
            </p>
          </div>
          <div className="p-3.5 rounded-md bg-slate-900/40 border border-slate-800 space-y-1">
            <div className="text-[11px] font-mono text-slate-300 font-medium flex items-center gap-1.5 uppercase">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Authoritative UTC Expiry
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict database timestamps reject any expired access tokens deterministically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 text-left">
      {/* Vault Header & Integrated Telemetry Ribbon */}
      <div className="rounded-[4px] border border-[#1e293b] bg-[#0b1326] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-slate-100 tracking-tight font-mono uppercase">
                Encrypted Vault Ledger
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-[#171f33] text-emerald-400 border border-emerald-500/30 font-semibold">
                E2EE ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-tenant isolated vault with row-level concurrency protection and authenticated AES-256-GCM payload encryption.
            </p>
          </div>

          <Link href="/notes/new">
            <Button variant="primary" size="sm" className="gap-1.5 shrink-0 uppercase tracking-wider text-[11px] font-mono">
              <Plus className="w-3.5 h-3.5" />
              <span>Draft Secret</span>
            </Button>
          </Link>
        </div>

        {/* Integrated Telemetry Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1e293b] text-xs font-mono">
          <div className="p-2.5 rounded-[4px] bg-[#060e20] border border-[#1e293b]">
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">Vault Records</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{totalNotes} <span className="text-[10px] font-normal text-slate-500">PAYLOADS</span></div>
          </div>
          <div className="p-2.5 rounded-[4px] bg-[#060e20] border border-[#1e293b]">
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">Active Dispatches</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
              {activeLinks} <span className="text-[10px] font-normal text-slate-500">LIVE</span>
            </div>
          </div>
          <div className="p-2.5 rounded-[4px] bg-[#060e20] border border-[#1e293b]">
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">Verified Decryptions</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{totalViews} <span className="text-[10px] font-normal text-slate-500">READS</span></div>
          </div>
          <div className="p-2.5 rounded-[4px] bg-[#060e20] border border-[#1e293b]">
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">Cipher Primitive</div>
            <div className="text-xs font-semibold text-slate-300 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              AES-256-GCM
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Toolbar: Search and Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-1.5 rounded-[4px] bg-[#060e20] border border-[#1e293b]">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter records by identifier or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-transparent border-0 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 font-mono"
          />
        </div>

        <div className="flex items-center gap-1 self-end sm:self-center text-xs font-mono">
          <button
            type="button"
            onClick={() => setFilterMode("ALL")}
            className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
              filterMode === "ALL"
                ? "bg-[#171f33] text-slate-100 border border-[#334155]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0b1326] border border-transparent"
            }`}
          >
            ALL [{notes.length}]
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("ACTIVE")}
            className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
              filterMode === "ACTIVE"
                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0b1326] border border-transparent"
            }`}
          >
            ACTIVE [{activeLinks}]
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("VIEWED")}
            className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
              filterMode === "VIEWED"
                ? "bg-[#171f33] text-slate-200 border border-[#334155]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0b1326] border border-transparent"
            }`}
          >
            CLAIMED
          </button>
        </div>
      </div>

      {/* Ledger Records Table */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-10 rounded-[4px] border border-[#1e293b] bg-[#0b1326]/50">
          <p className="text-xs text-slate-400 font-mono">No vault records match &quot;{searchQuery}&quot;</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilterMode("ALL");
            }}
            className="text-xs font-mono text-emerald-400 hover:underline mt-1.5 cursor-pointer"
          >
            Reset query filters
          </button>
        </div>
      ) : (
        <div className="rounded-[4px] border border-[#1e293b] bg-[#0b1326] overflow-hidden divide-y divide-[#1e293b]">
          {/* Table Header (Desktop) */}
          <div className="hidden sm:grid sm:grid-cols-12 px-4 py-2 bg-[#060e20] text-[10px] font-mono uppercase tracking-wider text-slate-500 border-b border-[#1e293b]">
            <div className="col-span-6">Secret Identifier &amp; Title</div>
            <div className="col-span-3">Dispatch Policy</div>
            <div className="col-span-3 text-right">Decryption Telemetry</div>
          </div>

          {filteredNotes.map((note) => {
            const hasActiveLink = note.activeLinksCount > 0;

            return (
              <div
                key={note.id}
                className="p-3.5 sm:px-4 sm:py-3.5 hover:bg-[#0f172a] transition-colors flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2.5 sm:gap-3 text-xs"
              >
                {/* Col 1: Title & Ref ID */}
                <div className="col-span-6 space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] bg-[#060e20] border border-[#1e293b]">
                      #sec_{note.id.slice(0, 8)}
                    </span>
                    <Link
                      href={`/notes/${note.id}`}
                      className="font-medium text-slate-100 hover:text-emerald-400 transition-colors truncate"
                    >
                      {note.title}
                    </Link>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Created {new Date(note.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })} · AES-256-GCM
                  </div>
                </div>

                {/* Col 2: Policy Status */}
                <div className="col-span-3 flex items-center gap-1.5">
                  {hasActiveLink ? (
                    <Badge variant="active">
                      {note.activeLinksCount} Active Share{note.activeLinksCount > 1 ? "s" : ""}
                    </Badge>
                  ) : (
                    <Badge variant="expired">No Active Shares</Badge>
                  )}
                </div>

                {/* Col 3: Views & Action */}
                <div className="col-span-3 flex items-center justify-between sm:justify-end gap-3">
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-500" />
                    <strong className="text-slate-200">{note.totalViews}</strong>
                  </span>

                  <Link href={`/notes/${note.id}`}>
                    <Button variant="secondary" size="sm" className="gap-1 font-mono text-[11px] h-7 px-2.5">
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


