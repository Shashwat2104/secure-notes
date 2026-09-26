"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Shield, Clock, Key, Flame, Globe, Terminal, ArrowRight, Lock, Check } from "lucide-react";

export function NoteForm() {
  const router = useRouter();

  // Default expiration: 1 hour in the future (formatted for datetime-local)
  const getDefaultExpiry = () => {
    const d = new Date(Date.now() + 3600 * 1000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expiresAt, setExpiresAt] = useState(getDefaultExpiry());
  const [shareType, setShareType] = useState<"TIME_BASED" | "ONE_TIME">("TIME_BASED");
  const [accessType, setAccessType] = useState<"PUBLIC" | "PASSWORD_PROTECTED">("PUBLIC");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick expiration presets
  const setPresetExpiry = (minutes: number) => {
    const d = new Date(Date.now() + minutes * 60 * 1000);
    setExpiresAt(
      new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const expiryUtc = new Date(expiresAt).toISOString();

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          expiresAt: expiryUtc,
          shareType,
          accessType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create secret record.");
        return;
      }

      // Store one-time access key in sessionStorage if generated
      if (data.shareLink?.accessKey) {
        sessionStorage.setItem(`accessKey_${data.id}`, data.shareLink.accessKey);
      }
      if (data.shareLink?.shareUrl) {
        sessionStorage.setItem(`shareUrl_${data.id}`, data.shareLink.shareUrl);
      }

      router.push(`/notes/${data.id}?created=true`);
    } catch {
      setError("An unexpected network error occurred while communicating with the cryptographic service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const byteSize = new Blob([content]).size;

  return (
    <div className="max-w-4xl w-full mx-auto space-y-4 text-left">
      {/* Chamber Header */}
      <div className="p-4 sm:p-5 rounded-md border border-slate-800 bg-slate-900/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[4px] bg-slate-950 border border-slate-700/80 flex items-center justify-center text-emerald-400 shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-100 tracking-tight font-mono uppercase">
                Cryptographic Drafting Chamber
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Prepare and encrypt secrets with single-read self-destruction and Argon2id access policies.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ZERO-KNOWLEDGE
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="error" title="Cryptographic Service Rejection">
            {error}
          </Alert>
        )}

        {/* 2-Column Workbench Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Column (Payload Studio): 7 cols */}
          <div className="lg:col-span-7 space-y-4 rounded-md border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-400">
                01 // Secret Payload
              </span>
            </div>

            <Input
              label="Secret Identifier / Title"
              placeholder="e.g. AWS Production KMS Secret / DB Credentials"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                <span className="uppercase tracking-wider">Raw Payload (Plaintext)</span>
                <span className="text-slate-500">
                  {content.length.toLocaleString()} chars · {byteSize} bytes
                </span>
              </div>
              <textarea
                rows={9}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-md text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 font-mono transition-colors resize-y leading-relaxed"
                placeholder="Paste confidential credentials, SSH keys, certificates, or tokens..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={65536}
                required
              />
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                <Lock className="w-3 h-3 text-emerald-400" />
                Encrypted at rest using AES-256-GCM. Plaintext is never stored unencrypted.
              </div>
            </div>
          </div>

          {/* Configuration Column (Policy Matrix): 5 cols */}
          <div className="lg:col-span-5 space-y-4 rounded-md border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-400">
                02 // Policy Matrix
              </span>
            </div>

            {/* Destruction Policy */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-slate-400">
                Destruction Policy
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setShareType("TIME_BASED")}
                  className={`p-2.5 rounded-md border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    shareType === "TIME_BASED"
                      ? "border-emerald-500/60 bg-emerald-950/20 text-slate-100"
                      : "border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Clock className={`w-4 h-4 mt-0.5 shrink-0 ${shareType === "TIME_BASED" ? "text-emerald-400" : "text-slate-500"}`} />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-200">Time-Based Window</div>
                    <div className="text-[11px] text-slate-400 leading-normal mt-0.5">
                      Multi-read access until the strict UTC expiration cutoff.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShareType("ONE_TIME")}
                  className={`p-2.5 rounded-md border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    shareType === "ONE_TIME"
                      ? "border-amber-500/60 bg-amber-950/20 text-slate-100"
                      : "border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Flame className={`w-4 h-4 mt-0.5 shrink-0 ${shareType === "ONE_TIME" ? "text-amber-400" : "text-slate-500"}`} />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-200">Atomic Burn-After-Reading</div>
                    <div className="text-[11px] text-slate-400 leading-normal mt-0.5">
                      Permanently erased upon 1st decryption via SQL row-level lock.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Access Control Requirement */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-slate-400">
                Access Protection
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAccessType("PUBLIC")}
                  className={`p-2 rounded-md border text-left transition-colors cursor-pointer ${
                    accessType === "PUBLIC"
                      ? "border-slate-600 bg-slate-800 text-slate-100"
                      : "border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="font-mono text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-sky-400" />
                    Public Token
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">CSPRNG URL</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessType("PASSWORD_PROTECTED")}
                  className={`p-2 rounded-md border text-left transition-colors cursor-pointer ${
                    accessType === "PASSWORD_PROTECTED"
                      ? "border-emerald-500/60 bg-emerald-950/20 text-slate-100"
                      : "border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="font-mono text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                    <Key className="w-3 h-3 text-emerald-400" />
                    Argon2id Key
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Memory-Hard Key</div>
                </button>
              </div>
            </div>

            {/* Expiration Preset */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-slate-400">
                  UTC Expiration
                </label>
                <div className="flex gap-1 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setPresetExpiry(10)}
                    className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 cursor-pointer"
                  >
                    10m
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetExpiry(60)}
                    className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 cursor-pointer"
                  >
                    1h
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetExpiry(1440)}
                    className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 cursor-pointer"
                  >
                    24h
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetExpiry(10080)}
                    className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 cursor-pointer"
                  >
                    7d
                  </button>
                </div>
              </div>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-100 text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Action Dispatch Bar */}
        <div className="p-3.5 sm:p-4 rounded-md border border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>Ready for cryptographic compilation & dispatch</span>
          </div>

          <Button
            type="submit"
            size="md"
            className="w-full sm:w-auto px-6 font-mono text-xs uppercase tracking-wider"
            loading={isSubmitting}
          >
            <span>{isSubmitting ? "Encrypting & Sealing..." : "Generate Encrypted Secret & Dispatch Link"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

