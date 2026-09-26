"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Lock, Key, ShieldAlert } from "lucide-react";
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
      setError("An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <CardTitle>Protected Note</CardTitle>
        <CardDescription>
          This note is password-protected. Enter the dynamic access key provided by the sender to decrypt and view the content.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleUnlock} className="space-y-4">
        {retryAfter !== null && (
          <Alert variant="warning" title="Rate Limit Exceeded">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Maximum failed attempts exceeded. Please wait <strong>{retryAfter} seconds</strong> before trying again.
              </span>
            </div>
          </Alert>
        )}

        {error && retryAfter === null && (
          <Alert variant="error" title="Access Denied">
            {error}
          </Alert>
        )}

        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-medium text-slate-300">
            Access Key
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., K8F4-X92M"
              value={accessKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              disabled={retryAfter !== null}
              className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 text-center font-mono text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              maxLength={12}
              required
            />
            <Key className="w-4 h-4 text-slate-500 absolute left-3 top-4" />
          </div>
          <p className="text-xs text-slate-500 text-center">
            Keys are case-insensitive.
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting || retryAfter !== null}
        >
          {isSubmitting ? "Verifying Access Key..." : "Unlock Note"}
        </Button>
      </form>
    </Card>
  );
}
