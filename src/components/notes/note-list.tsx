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
    <div className="space-y-4 text-left">
      {/* Vault Header & Integrated Telemetry Ribbon (Replacing generic KPI cards) */}
      <div className="rounded-md border border-slate-800 bg-slate-900/70 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-100 tracking-tight font-mono uppercase">
                Encrypted Vault Ledger
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[3px] bg-slate-800 text-slate-300 border border-slate-700">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-tenant isolated vault with row-level concurrency protection and cryptographic hash validation.
            </p>
          </div>

          <Link href="/notes/new">
            <Button variant="primary" size="sm" className="gap-1.5 shrink-0">
              <Plus className="w-3.5 h-3.5" />
              <span>Draft New Secret</span>
            </Button>
          </Link>
        </div>

        {/* Integrated Telemetry Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
          <div className="p-2.5 rounded-[4px] bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">Vault Records</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{totalNotes} <span className="text-[10px] font-normal text-slate-500">SECRETS</span></div>
          </div>
          <div className="p-2.5 rounded-[4px] bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">Active Dispatches</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">{activeLinks} <span className="text-[10px] font-normal text-slate-500">LIVE</span></div>
          </div>
          <div className="p-2.5 rounded-[4px] bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">Verified Decryptions</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{totalViews} <span className="text-[10px] font-normal text-slate-500">VIEWS</span></div>
          </div>
          <div className="p-2.5 rounded-[4px] bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">Encryption Engine</div>
            <div className="text-xs font-semibold text-slate-300 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              AES-256-GCM
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Toolbar: Search and Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-1.5 rounded-md bg-slate-950 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search records by secret title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-transparent border-0 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0"
          />
        </div>

        <div className="flex items-center gap-1 self-end sm:self-center text-xs font-mono">
          <button
            type="button"
            onClick={() => setFilterMode("ALL")}
            className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
              filterMode === "ALL"
                ? "bg-slate-800 text-slate-100 border border-slate-700"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            ALL [{notes.length}]
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("ACTIVE")}
            className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
              filterMode === "ACTIVE"
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            ACTIVE [{activeLinks}]
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("VIEWED")}
            className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
              filterMode === "VIEWED"
                ? "bg-slate-800 text-slate-200 border border-slate-700"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            CLAIMED
          </button>
        </div>
      </div>

      {/* Ledger Records Table */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-10 rounded-md border border-slate-800 bg-slate-900/30">
          <p className="text-xs text-slate-400 font-mono">No vault records match &quot;{searchQuery}&quot;</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilterMode("ALL");
            }}
            className="text-xs font-mono text-emerald-400 hover:underline mt-1.5 cursor-pointer"
          >
            Clear filter query
          </button>
        </div>
      ) : (
        <div className="rounded-md border border-slate-800 bg-slate-900/40 overflow-hidden divide-y divide-slate-800/80">
          {filteredNotes.map((note) => {
            const hasActiveLink = note.activeLinksCount > 0;

            return (
              <div
                key={note.id}
                className="p-3 sm:p-4 hover:bg-slate-850/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                      #{note.id.slice(0, 8)}
                    </span>
                    <Link
                      href={`/notes/${note.id}`}
                      className="font-medium text-slate-100 hover:text-emerald-400 transition-colors truncate"
                    >
                      {note.title}
                    </Link>

                    {hasActiveLink ? (
                      <Badge variant="active">
                        {note.activeLinksCount} Active Share{note.activeLinksCount > 1 ? "s" : ""}
                      </Badge>
                    ) : (
                      <Badge variant="expired">No Active Shares</Badge>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono">
                    <span className="text-slate-500">
                      Created: {new Date(note.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-500" />
                      <strong className="text-slate-200">{note.totalViews}</strong> view{note.totalViews === 1 ? "" : "s"} recorded
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link href={`/notes/${note.id}`}>
                    <Button variant="secondary" size="sm" className="gap-1 font-mono text-[11px]">
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
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


