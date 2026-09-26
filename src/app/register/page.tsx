import { Navbar } from "@/components/layout/navbar";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <RegisterForm />
      </main>
    </>
  );
}
