import AuthShell from "@/features/auth/components/AuthShell";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Sign In — CEMS",
  description: "Sign in to the AASTU Campus Event Management System.",
};

export default function LoginPage() {
  return (
    <AuthShell
      badge="AUTH GATEWAY — PORTAL ACCESS"
      title={
        <>
          The campus event
          <br />
          <span className="text-brand">operating system.</span>
        </>
      }
      subtitle="Sign in to discover, manage, and participate in every campus experience at AASTU."
    >
      <LoginForm />
    </AuthShell>
  );
}
