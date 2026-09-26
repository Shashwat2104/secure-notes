import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Suspense fallback={<div className="text-slate-400 text-sm">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
