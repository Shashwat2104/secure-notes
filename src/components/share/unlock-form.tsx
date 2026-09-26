"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Lock, Key, ShieldAlert, Terminal } from "lucide-react";
import { SharedNoteResponse } from "@/types";

interface UnlockFormProps {
  token: string;
  onUnlocked: (note: SharedNoteResponse) => void;
}

export function UnlockForm({ token, onUnlocked }: UnlockFormProps) {
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (retryAfter === null || retryAfter <= 0) return;

    const timer = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfter]);

  const handleKeyChange = (val: string) => {
    // Auto format: uppercase, strip invalid chars, format XXXX-XXXX
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setAccessKey(cleaned);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (retryAfter) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/share/${token}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey: accessKey.trim() }),
      });

      const data = await res.json();

      if (res.status === 429) {
        const retryHeader = res.headers.get("Retry-After");
        const seconds = retryHeader ? parseInt(retryHeader, 10) : 900;
        setRetryAfter(seconds);
        setError("Too many failed attempts. Temporary lockout enforced.");
        return;
      }

      if (!res.ok) {
        setError(data.error || "Invalid access key.");
        return;
      }

      onUnlocked(data);
    } catch {
      setError("An unexpected network error occurred while verifying access key.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-5 sm:p-6 rounded-md border border-slate-800 bg-slate-900/80 space-y-4 text-left">
      <div className="text-center space-y-2 pb-2 border-b border-slate-800">
        <div className="w-10 h-10 rounded-[4px] bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold font-mono text-slate-100 uppercase tracking-wide">
            Zero-Knowledge Decryption Challenge
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            This secret requires an Argon2id access key. Enter the exact key provided by the sender to verify and decrypt the secret content.
          </p>
        </div>
      </div>

      <form onSubmit={handleUnlock} className="space-y-4">
        {retryAfter !== null && (
          <Alert variant="warning" title="Rate Limit Lockout Active">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Maximum failed attempts exceeded. Lockout active:{" "}
                <strong className="font-mono text-amber-300">{retryAfter}s</strong> remaining.
              </span>
            </div>
          </Alert>
        )}

        {error && retryAfter === null && (
          <Alert variant="error" title="Access Key Verification Failed">
            {error}
          </Alert>
        )}

        <div className="space-y-1">
          <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-slate-300">
            Recipient Access Key
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="XXXX-XXXX-XXXX"
              value={accessKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              disabled={retryAfter !== null}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-md text-slate-100 placeholder-slate-600 text-center font-mono text-base font-bold tracking-widest focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:opacity-50 transition-colors uppercase"
              maxLength={16}
              required
            />
            <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
          </div>
          <p className="text-[10px] text-slate-500 text-center font-mono">
            Key input is case-insensitive. Brute-force rate limiting enforced.
          </p>
        </div>

        <Button
          type="submit"
          size="md"
          className="w-full font-mono text-xs uppercase tracking-wider"
          loading={isSubmitting}
          disabled={retryAfter !== null}
        >
          <span>{isSubmitting ? "Deriving Key & Decrypting..." : "Decrypt & Reveal Secret"}</span>
        </Button>
      </form>
    </div>
  );
}

