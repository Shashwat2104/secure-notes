"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Clock,
  Key,
  Eye,
  Copy,
  Check,
  Ban,
  ArrowLeft,
  Flame,
  Globe,
  Terminal,
  ShieldAlert,
} from "lucide-react";
import { NoteDetailResponse } from "@/types";

interface NoteDetailProps {
  note: NoteDetailResponse;
  initialCreated?: boolean;
}

export function NoteDetail({ note: initialNote, initialCreated }: NoteDetailProps) {
  const [note, setNote] = useState(initialNote);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [oneTimeAccessKey, setOneTimeAccessKey] = useState<string | null>(null);
  const [oneTimeShareUrl, setOneTimeShareUrl] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  useEffect(() => {
    // Check if session storage has the one-time access key or share URL from creation
    const storedKey = sessionStorage.getItem(`accessKey_${note.id}`);
    const storedUrl = sessionStorage.getItem(`shareUrl_${note.id}`);

    if (storedKey) {
      setOneTimeAccessKey(storedKey);
    }
    if (storedUrl) {
      setOneTimeShareUrl(storedUrl);
    }
  }, [note.id]);

  const primaryLink = note.shareLinks[0];

  const handleCopyLink = () => {
    const url = oneTimeShareUrl || primaryLink?.shareUrl;
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyKey = () => {
    if (oneTimeAccessKey) {
      navigator.clipboard.writeText(oneTimeAccessKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleRevoke = async (linkId: string) => {
    if (!confirm("Are you sure you want to revoke this share link? Access will be immediately and permanently blocked.")) {
      return;
    }

    setIsRevoking(true);
    setRevokeError(null);

    try {
      const res = await fetch(`/api/share/${linkId}/revoke`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        setRevokeError(data.error || "Failed to revoke link.");
        return;
      }

      // Refresh note status locally
      setNote((prev) => ({
        ...prev,
        shareLinks: prev.shareLinks.map((l) =>
          l.id === linkId ? { ...l, status: "REVOKED", revokedAt: new Date() } : l
        ),
      }));
    } catch {
      setRevokeError("Network error while revoking share link.");
    } finally {
      setIsRevoking(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="active">Active</Badge>;
      case "CONSUMED":
        return <Badge variant="consumed">Consumed</Badge>;
      case "EXPIRED":
        return <Badge variant="expired">Expired</Badge>;
      case "REVOKED":
        return <Badge variant="revoked">Revoked</Badge>;
      default:
        return null;
    }
  };

  const [copiedContent, setCopiedContent] = useState(false);
  const handleCopyContent = () => {
    if (note.content) {
      navigator.clipboard.writeText(note.content);
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-4 text-left">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/notes"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>[BACK TO VAULT LEDGER]</span>
        </Link>
        <span className="text-[11px] font-mono text-slate-500">
          RECORD_ID: #{note.id.slice(0, 12)}
        </span>
      </div>

      {/* One-Time Access Key Voucher */}
      {oneTimeAccessKey && (
        <div className="p-4 sm:p-5 rounded-md border border-amber-500/40 bg-amber-950/20 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-[4px] bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Key className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-mono font-semibold text-xs text-amber-300 uppercase tracking-wide">
                Dynamic Access Key Voucher
              </h3>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                This note is protected with Argon2id. The recipient must provide this key to decrypt the secret.
                <strong> This key cannot be retrieved again once this tab is closed.</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-slate-950 rounded border border-amber-500/30">
            <span className="text-lg sm:text-xl font-mono font-bold tracking-widest text-amber-300 flex-1 select-all">
              {oneTimeAccessKey}
            </span>
            <Button
              size="sm"
              variant="amber"
              onClick={handleCopyKey}
              className="gap-1 font-mono text-xs"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? "COPIED" : "COPY KEY"}</span>
            </Button>
          </div>
        </div>
      )}

      {revokeError && (
        <Alert variant="error" title="Revocation Service Error">
          {revokeError}
        </Alert>
      )}

      {/* Record Overview & Dispatch Center */}
      <div className="rounded-md border border-slate-800 bg-slate-900/70 p-4 sm:p-5 space-y-4">
        {/* Record Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold text-slate-100">{note.title}</h1>
              {primaryLink && renderStatusBadge(primaryLink.status)}
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Created on {new Date(note.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })} UTC · AES-256-GCM Encrypted
            </p>
          </div>
        </div>

        {/* Secret Content Terminal Viewer */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
            <span className="uppercase tracking-wider">Encrypted Payload Storage</span>
            <button
              type="button"
              onClick={handleCopyContent}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              {copiedContent ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedContent ? "Copied" : "Copy Payload"}</span>
            </button>
          </div>
          <div className="p-3 sm:p-4 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
            {note.content}
          </div>
        </div>

        {/* Share Links Dispatch Strip */}
        {note.shareLinks.map((link) => (
          <div
            key={link.id}
            className="p-3.5 sm:p-4 rounded border border-slate-800 bg-slate-950/70 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-300">
                  Dispatch Channel Token
                </span>
                {renderStatusBadge(link.status)}
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1 text-slate-300">
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span><strong>{link.viewCount}</strong> Verified Decryptions</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Expires: {new Date(link.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                </div>
              </div>
            </div>

            {/* Share URL Field */}
            {(oneTimeShareUrl || link.shareUrl) && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Public Recipient Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={oneTimeShareUrl || link.shareUrl}
                    className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-300 select-all focus:outline-none"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopyLink}
                    className="gap-1 font-mono text-xs shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "COPIED" : "COPY LINK"}</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Metadata Parameters Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-500 block">Policy</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                  {link.shareType === "ONE_TIME" ? (
                    <>
                      <Flame className="w-3 h-3 text-amber-400" /> Single Burn
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-slate-400" /> Time-Based
                    </>
                  )}
                </span>
              </div>

              <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-500 block">Protection</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                  {link.accessType === "PASSWORD_PROTECTED" ? (
                    <>
                      <Key className="w-3 h-3 text-emerald-400" /> Argon2id Key
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3 text-sky-400" /> Public Token
                    </>
                  )}
                </span>
              </div>

              <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-500 block">Claim State</span>
                <span className="font-semibold text-slate-200 block mt-0.5">
                  {link.consumedAt ? "CONSUMED" : link.shareType === "ONE_TIME" ? "AWAITING READ" : "AVAILABLE"}
                </span>
              </div>

              <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-500 block">Revocation</span>
                <span className="font-semibold text-slate-200 block mt-0.5">
                  {link.revokedAt ? "REVOKED" : "ACTIVE"}
                </span>
              </div>
            </div>

            {/* Revoke Killswitch */}
            {link.status === "ACTIVE" && (
              <div className="pt-1 flex justify-end">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRevoke(link.id)}
                  loading={isRevoking}
                  className="gap-1 font-mono text-xs"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{isRevoking ? "Revoking..." : "Revoke & Invalidate Token"}</span>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

