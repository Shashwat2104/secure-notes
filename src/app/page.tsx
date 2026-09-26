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
  Check,
  Cpu,
  Layers,
  Terminal,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  return (
    <>
      <Navbar user={session?.user} />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 flex flex-col justify-center items-center text-center">
        {/* Specification Identifier Pill */}
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
          <span>ZERO-KNOWLEDGE COURIER // RFC-GRADE PROTOCOL</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-100 tracking-tight max-w-3xl leading-tight font-mono">
          Deterministic Secret Exchange with{" "}
          <span className="text-emerald-400">
            Row-Level Concurrency Locks
          </span>
        </h1>

        {/* Technical Subtitle */}
        <p className="mt-4 text-xs sm:text-sm lg:text-base text-slate-400 max-w-2xl leading-relaxed">
          Engineered for mission-critical credentials, certificates, and API tokens.
          Enforces atomic single-winner destruction, Argon2id memory-hard key derivation, and authoritative UTC lifecycle validation.
        </p>

        {/* Primary CTAs */}
        <div className="mt-6 flex flex-wrap gap-2.5 justify-center font-mono text-xs">
          {session?.user ? (
            <Link href="/notes/new">
              <Button size="md" className="gap-2 uppercase tracking-wider font-semibold">
                <span>Draft Encrypted Secret</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="md" className="gap-2 uppercase tracking-wider font-semibold">
                  <span>Initialize Vault Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="md" className="uppercase tracking-wider">
                  <span>Sign In</span>
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Protocol Pipeline Diagram (Authentic, not fake macOS window) */}
        <div className="mt-12 w-full rounded-md border border-slate-800 bg-slate-900/60 p-4 sm:p-5 text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                Cryptographic Execution Pipeline
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              SPEC: AES-256-GCM + ARGON2ID + SHA-256
            </span>
          </div>

          {/* Pipeline Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] uppercase text-emerald-400 font-bold">01 // Plaintext</div>
              <div className="text-slate-200 font-semibold">Client Sealing</div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Encrypted in memory. Server never logs raw plaintext or unhashed keys.
              </p>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] uppercase text-emerald-400 font-bold">02 // Key Derivation</div>
              <div className="text-slate-200 font-semibold">Argon2id Hash</div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Memory-hard hash computed at rest with calibrated salt parameters.
              </p>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] uppercase text-amber-400 font-bold">03 // Concurrency</div>
              <div className="text-slate-200 font-semibold">Row-Level Lock</div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Atomic conditional SQL update guarantees single-winner destruction.
              </p>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] uppercase text-rose-400 font-bold">04 // Shredding</div>
              <div className="text-slate-200 font-semibold">Single Burn</div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Marked consumed immediately upon claim. Further requests receive 404/410.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Specification Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-left w-full">
          <div className="p-4 rounded-md bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[4px] bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-mono text-xs font-bold text-slate-200 uppercase">
                Atomic Single-Winner
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Row-level conditional updates eliminate race conditions. 20 concurrent decryption requests yield exactly 1 authorized reveal and 19 rejections.
            </p>
          </div>

          <div className="p-4 rounded-md bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[4px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Key className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-mono text-xs font-bold text-slate-200 uppercase">
                Memory-Hard Keys
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamic access keys are hashed with Argon2id parameters. Plaintext passwords or secrets are never persisted in the database or server logs.
            </p>
          </div>

          <div className="p-4 rounded-md bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[4px] bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                <Database className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-mono text-xs font-bold text-slate-200 uppercase">
                Brute-Force Lockout
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sliding-window IP and token rate limiting. 5 consecutive invalid key attempts enforce an automated 15-minute lockout without revealing token existence.
            </p>
          </div>
        </div>

        {/* Architectural Standards Checklist */}
        <div className="mt-4 p-4 rounded-md border border-slate-800 bg-slate-950/70 w-full text-left">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2.5">
            Operational Verification Standards
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>SHA-256 blind indexing prevents URL token leakage</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Deterministic UTC expiration timestamps</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Multi-tenant session isolation via Auth.js v5</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero-knowledge client-side decryption flow</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

