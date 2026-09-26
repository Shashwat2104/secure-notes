"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Shield, Clock, Key, Eye, Flame, Globe } from "lucide-react";

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
        setError(data.error || "Failed to create note.");
        return;
      }

      // Store one-time access key in sessionStorage if generated so note-detail page can display it once
      if (data.shareLink?.accessKey) {
        sessionStorage.setItem(`accessKey_${data.id}`, data.shareLink.accessKey);
      }
      if (data.shareLink?.shareUrl) {
        sessionStorage.setItem(`shareUrl_${data.id}`, data.shareLink.shareUrl);
      }

      router.push(`/notes/${data.id}?created=true`);
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <span>Create a Secure Note</span>
        </CardTitle>
        <CardDescription>
          Configure cryptographic share tokens, access key protection, and automated expiration policies.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="error" title="Submission Error">
            {error}
          </Alert>
        )}

        <Input
          label="Note Title"
          placeholder="e.g., Production API Secret Key"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />

        <div className="space-y-1.5 text-left">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-slate-300">
              Note Content
            </label>
            <span className="text-xs text-slate-500">
              {content.length} / 65,536 chars
            </span>
          </div>
          <textarea
            rows={7}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-colors"
            placeholder="Paste credentials, secrets, or confidential messages here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={65536}
            required
          />
        </div>

        {/* Share Type Selection */}
        <div className="space-y-2 text-left">
          <label className="block text-sm font-medium text-slate-300">
            Share Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShareType("TIME_BASED")}
              className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                shareType === "TIME_BASED"
                  ? "border-blue-500 bg-blue-950/40 text-white ring-1 ring-blue-500"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-300"
              }`}
            >
              <Clock className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-slate-100">Time-Based Access</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Link remains accessible repeatedly until expiration cutoff.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShareType("ONE_TIME")}
              className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                shareType === "ONE_TIME"
                  ? "border-amber-500 bg-amber-950/40 text-white ring-1 ring-amber-500"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-300"
              }`}
            >
              <Flame className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-slate-100">One-Time Self-Destruct</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Link can be viewed exactly once and permanently self-destructs.
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Access Type Selection */}
        <div className="space-y-2 text-left">
          <label className="block text-sm font-medium text-slate-300">
            Access Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccessType("PUBLIC")}
              className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                accessType === "PUBLIC"
                  ? "border-blue-500 bg-blue-950/40 text-white ring-1 ring-blue-500"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-300"
              }`}
            >
              <Globe className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-slate-100">Public</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Anyone with the unique token link can view without a password.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAccessType("PASSWORD_PROTECTED")}
              className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                accessType === "PASSWORD_PROTECTED"
                  ? "border-emerald-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-300"
              }`}
            >
              <Key className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-slate-100">Password Protected</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Generates an access key that must be provided to unlock.
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Expiration Date / Presets */}
        <div className="space-y-2 text-left">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-slate-300">
              Expiration Cutoff ({shareType === "ONE_TIME" ? "Maximum Safety Lifetime" : "Valid Until"})
            </label>
            <div className="flex gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setPresetExpiry(10)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
              >
                10m
              </button>
              <button
                type="button"
                onClick={() => setPresetExpiry(60)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
              >
                1h
              </button>
              <button
                type="button"
                onClick={() => setPresetExpiry(1440)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
              >
                24h
              </button>
              <button
                type="button"
                onClick={() => setPresetExpiry(10080)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
              >
                7d
              </button>
            </div>
          </div>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-slate-500">
            Enforced strictly on the server using UTC timestamps.
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Generating Secure Note..." : "Create & Generate Share Link"}
        </Button>
      </form>
    </Card>
  );
}
