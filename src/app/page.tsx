import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Flame,
  Clock,
  Key,
  Database,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  return (
    <>
      <Navbar user={session?.user} />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 flex flex-col justify-center items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/70 border border-blue-800 text-blue-300 text-xs font-medium mb-6">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>Production-Grade Concurrency & Ephemeral Security</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight max-w-3xl leading-tight">
          Secure, Ephemeral Notes with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Guaranteed Concurrency
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Share sensitive credentials, passwords, and private messages with confidence.
          Features atomic single-claim one-time links, Argon2id access keys, SHA-256 token hashing at rest,
          and distributed brute-force protection.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          {session?.user ? (
            <Link href="/notes/new">
              <Button size="lg" className="gap-2">
                <span>Create Secure Note</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  <span>Sign In</span>
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Engineering Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Atomic One-Time Links</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Row-level conditional SQL updates prevent race conditions under arbitrary concurrency.
              20 concurrent requests result in exactly 1 view and 1 consumption.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Argon2id Dynamic Keys</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamic access keys are displayed once and hashed with memory-hard Argon2id at rest.
              No plaintext passwords or access keys are ever stored or logged.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Brute-Force & Rate Limiting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Distributed sliding-window rate limiting keyed by IP and share link.
              5 failed attempts trigger automated HTTP 429 throttling without leaking existence.
            </p>
          </div>
        </div>

        {/* Security Checklist Section */}
        <div className="mt-16 p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 w-full text-left">
          <h4 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span>Architecture & Security Standards</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Next.js App Router + Route Handlers + Service Layer</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>SHA-256 cryptographic token hashing at rest</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Authoritative UTC expiration enforcement</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-tenant session isolation (Auth.js v5)</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
