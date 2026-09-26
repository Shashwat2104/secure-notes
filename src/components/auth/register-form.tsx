"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Lock, Mail, User, ShieldCheck } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((err: any) => {
            if (err.path?.[0]) fieldErrors[err.path[0]] = err.message;
          });
          setErrors(fieldErrors);
        } else {
          setServerError(data.error || "Registration rejected by validation service");
        }
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setServerError("An unexpected network error occurred while communicating with the service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-5 sm:p-6 rounded-md border border-slate-800 bg-slate-900/80 space-y-4 text-left">
      <div className="text-center space-y-2 pb-2 border-b border-slate-800">
        <div className="w-9 h-9 rounded-[4px] bg-slate-950 border border-slate-700/80 text-emerald-400 mx-auto flex items-center justify-center">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold font-mono text-slate-100 uppercase tracking-wide">
            Initialize Vault Profile
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Register an operator account to configure, manage, and audit end-to-end encrypted secrets.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {serverError && (
          <Alert variant="error" title="Registration Service Rejection">
            {serverError}
          </Alert>
        )}

        <Input
          label="Operator Name"
          placeholder="Jane Doe"
          icon={<User className="w-3.5 h-3.5" />}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        <Input
          type="email"
          label="Email Address"
          placeholder="operator@enterprise.internal"
          icon={<Mail className="w-3.5 h-3.5" />}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
        />

        <Input
          type="password"
          label="Master Passphrase"
          placeholder="••••••••••••"
          icon={<Lock className="w-3.5 h-3.5" />}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          helperText="Requires ≥ 8 chars, 1 uppercase, 1 lowercase, 1 digit."
          required
        />

        <Input
          type="password"
          label="Confirm Master Passphrase"
          placeholder="••••••••••••"
          icon={<Lock className="w-3.5 h-3.5" />}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
          required
        />

        <Button
          type="submit"
          className="w-full mt-2 font-mono text-xs uppercase tracking-wider"
          size="md"
          loading={isSubmitting}
        >
          <span>{isSubmitting ? "Generating Credentials..." : "Initialize Vault Profile"}</span>
        </Button>

        <p className="text-[11px] font-mono text-center text-slate-400 pt-2 border-t border-slate-800/80">
          Already registered?{" "}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}

