import { Suspense } from "react";
import AuthShell from "@/features/auth/components/AuthShell";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Sign In — CEMS",
  description: "Sign in to the AASTU Campus Event Management System.",
};

export default function LoginPage() {
  return (
    <AuthShell
      badge="Welcome Back"
      title={
        <>
          The campus event
          <br />
          <span className="text-brand">operating system.</span>
        </>
      }
      subtitle="Sign in to discover, manage, and participate in every campus experience at AASTU."
    >
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin w-6 h-6 border-2 border-brand border-t-transparent rounded-full" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
