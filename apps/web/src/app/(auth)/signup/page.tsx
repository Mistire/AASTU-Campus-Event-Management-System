import { Suspense } from "react";
import AuthShell from "@/features/auth/components/AuthShell";
import { SignupForm } from "@/features/auth/components/SignupForm";

export const metadata = {
  title: "Create Account — CEMS",
  description: "Join the AASTU Campus Event Management System.",
};

export default function SignupPage() {
  return (
    <AuthShell
      badge="Join the Network"
      title={
        <>
          Your campus story
          <br />
          <span className="text-brand">starts here.</span>
        </>
      }
      subtitle="Join thousands of AASTU students and organizers already building the future of campus engagement."
    >
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin w-6 h-6 border-2 border-brand border-t-transparent rounded-full" />
        </div>
      }>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
