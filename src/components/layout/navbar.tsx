"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Plus, FileText, LogOut, LogIn, UserPlus, Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  onSignOut?: () => void;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isNotesActive = pathname === "/notes";
  const isNewActive = pathname === "/notes/new";

  return (
    <header className="border-b border-[#1e293b] bg-[#020617]/95 backdrop-blur-xs sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand & Cryptographic Telemetry */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-sm sm:text-base text-slate-100 hover:text-emerald-400 transition-colors"
          >
            <div className="w-7 h-7 rounded-[4px] bg-[#0b1326] border border-[#1e293b] flex items-center justify-center text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold tracking-tight">SECURE<span className="text-emerald-400">_VAULT</span></span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#0b1326] border border-[#1e293b] text-[10px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
            AES-256-GCM / ZERO-KNOWLEDGE
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 text-xs">
          {user ? (
            <>
              <Link href="/notes">
                <Button
                  variant={isNotesActive ? "secondary" : "ghost"}
                  size="sm"
                  className={isNotesActive ? "border-slate-700 bg-slate-800/90 text-white" : "text-slate-300"}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Vault Ledger</span>
                </Button>
              </Link>
              <Link href="/notes/new">
                <Button
                  variant={isNewActive ? "secondary" : "primary"}
                  size="sm"
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Secret</span>
                </Button>
              </Link>
              <div className="h-3.5 w-px bg-slate-800 mx-1.5" />
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span className="max-w-[140px] truncate">{user.email}</span>
              </div>
              <form action="/api/auth/signout" method="POST">
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 gap-1 px-2"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="sr-only lg:not-sr-only">Exit</span>
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-1.5 text-slate-300">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link href="/notes/new">
              <Button size="sm" className="h-7.5 px-2 text-xs">
                <Plus className="w-3.5 h-3.5 mr-0.5" />
                New
              </Button>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-[4px] hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3.5 space-y-2.5">
          {user ? (
            <>
              <div className="p-2 rounded-[4px] bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                <span className="truncate">{user.email}</span>
                <span className="text-[10px] text-emerald-400 uppercase font-semibold">AUTHENTICATED</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/notes" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full justify-center">
                    <FileText className="w-3.5 h-3.5" />
                    Vault Ledger
                  </Button>
                </Link>
                <Link href="/notes/new" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full justify-center">
                    <Plus className="w-3.5 h-3.5" />
                    Create Secret
                  </Button>
                </Link>
              </div>
              <form action="/api/auth/signout" method="POST">
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-rose-300 hover:bg-rose-950/30"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" size="sm" className="w-full justify-center">
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full justify-center">
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}


