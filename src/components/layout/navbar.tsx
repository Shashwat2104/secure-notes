"use client";

import Link from "next/link";
import { Shield, PlusCircle, FileText, LogOut, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  onSignOut?: () => void;
}

export function Navbar({ user, onSignOut }: NavbarProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-100 hover:text-blue-400 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
          <span>SecureNotes</span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/notes">
                <Button variant="ghost" size="sm" className="gap-2">
                  <FileText className="w-4 h-4" />
                  <span>My Notes</span>
                </Button>
              </Link>
              <Link href="/notes/new">
                <Button variant="primary" size="sm" className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Note</span>
                </Button>
              </Link>
              <div className="h-4 w-px bg-slate-800 mx-1" />
              <span className="text-xs text-slate-400 hidden sm:inline-block">
                {user.email}
              </span>
              <form action="/api/auth/signout" method="POST">
                <Button type="submit" variant="ghost" size="sm" className="text-slate-400 hover:text-red-400 gap-1.5">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
