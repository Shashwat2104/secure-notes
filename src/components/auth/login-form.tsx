"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Lock, Mail, ArrowRight, Shield } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password credentials.");
        return;
      }

      router.push("/notes");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-5 sm:p-6 rounded-md border border-slate-800 bg-slate-900/80 space-y-4 text-left">
      <div className="text-center space-y-2 pb-2 border-b border-slate-800">
        <div className="w-9 h-9 rounded-[4px] bg-slate-950 border border-slate-700/80 text-emerald-400 mx-auto flex items-center justify-center">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold font-mono text-slate-100 uppercase tracking-wide">
            Authenticate Vault Profile
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Enter your credentials to access encrypted notes and configure cryptographic share links.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {registered && (
          <Alert variant="success" title="Profile Registered">
            Your account was initialized successfully. You may now sign in.
          </Alert>
        )}

        {error && (
          <Alert variant="error" title="Authentication Rejected">
            {error}
          </Alert>
        )}

        <Input
          type="email"
          label="Email Address"
          placeholder="operator@enterprise.internal"
          icon={<Mail className="w-3.5 h-3.5" />}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          type="password"
          label="Master Passphrase"
          placeholder="••••••••••••"
          icon={<Lock className="w-3.5 h-3.5" />}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <Button
          type="submit"
          className="w-full mt-2 font-mono text-xs uppercase tracking-wider"
          size="md"
          loading={isSubmitting}
        >
          <span>{isSubmitting ? "Authenticating Session..." : "Authorize Vault Session"}</span>
        </Button>

        <p className="text-[11px] font-mono text-center text-slate-400 pt-2 border-t border-slate-800/80">
          Unregistered operator?{" "}
          <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
            Initialize Profile
          </Link>
        </p>
      </form>
    </div>
  );
}


