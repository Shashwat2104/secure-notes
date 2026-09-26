"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
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
  AlertTriangle,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-400">
            Active
          </span>
        );
      case "CONSUMED":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-950/70 border border-amber-800 text-amber-400">
            Consumed
          </span>
        );
      case "EXPIRED":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 border border-slate-700 text-slate-400">
            Expired
          </span>
        );
      case "REVOKED":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-950/70 border border-red-800 text-red-400">
            Revoked
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/notes" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Notes</span>
        </Link>
      </div>

      {/* One-Time Access Key Display Alert */}
      {oneTimeAccessKey && (
        <div className="p-5 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-200 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-base text-amber-300">
                Action Required: Save Dynamic Access Key
              </h4>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                This note is password-protected. The recipient must provide this exact access key to unlock the note.
                <strong> This key is displayed only once and cannot be recovered from the database.</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-950/80 rounded-lg border border-amber-600/30">
            <span className="text-xl font-mono font-bold tracking-widest text-amber-400 flex-1">
              {oneTimeAccessKey}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopyKey}
              className="gap-1.5"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey ? "Copied" : "Copy Key"}</span>
            </Button>
          </div>
        </div>
      )}

      {revokeError && (
        <Alert variant="error" title="Revocation Failed">
          {revokeError}
        </Alert>
      )}

      {/* Note Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>{note.title}</CardTitle>
            <div className="flex items-center gap-2">
              {primaryLink && getStatusBadge(primaryLink.status)}
            </div>
          </div>
          <CardDescription>
            Created on {new Date(note.createdAt).toLocaleString()}
          </CardDescription>
        </CardHeader>

        <div className="space-y-6">
          {/* Note Content Box */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Note Content
            </label>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-sm text-slate-200 whitespace-pre-wrap">
              {note.content}
            </div>
          </div>

          {/* Share Links Details */}
          {note.shareLinks.map((link) => (
            <div
              key={link.id}
              className="p-5 rounded-lg border border-slate-800 bg-slate-900/60 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">Share Link</span>
                  {getStatusBadge(link.status)}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span><strong>{link.viewCount}</strong> Verified Views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Expires: {new Date(link.expiresAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Share URL Box */}
              {(oneTimeShareUrl || link.shareUrl) && (
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Shareable URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={oneTimeShareUrl || link.shareUrl}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-300"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCopyLink}
                      className="gap-1.5"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Metadata Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80">
                  <span className="text-slate-500 block">Share Type</span>
                  <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                    {link.shareType === "ONE_TIME" ? (
                      <>
                        <Flame className="w-3.5 h-3.5 text-amber-400" /> One-Time
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-blue-400" /> Time-Based
                      </>
                    )}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80">
                  <span className="text-slate-500 block">Access Type</span>
                  <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                    {link.accessType === "PASSWORD_PROTECTED" ? (
                      <>
                        <Key className="w-3.5 h-3.5 text-emerald-400" /> Protected
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5 text-blue-400" /> Public
                      </>
                    )}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80">
                  <span className="text-slate-500 block">Single-Claim</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">
                    {link.consumedAt ? "Consumed" : link.shareType === "ONE_TIME" ? "Awaiting View" : "N/A"}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80">
                  <span className="text-slate-500 block">Revocation</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">
                    {link.revokedAt ? "Revoked" : "Active"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {link.status === "ACTIVE" && (
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRevoke(link.id)}
                    disabled={isRevoking}
                    className="gap-1.5"
                  >
                    <Ban className="w-4 h-4" />
                    <span>{isRevoking ? "Revoking..." : "Revoke Share Link"}</span>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
