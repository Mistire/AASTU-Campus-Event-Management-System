import { Suspense } from "react";
import AuthShell from "@/features/auth/components/AuthShell";
import { Loader2 } from "lucide-react";
import { VerifyEmailContent } from "@/features/auth/components/VerifyEmailContent";

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Verify Your Email"
      subtitle="Complete your registration to unlock the full potential of the CEMS ecosystem."
    >
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-brand animate-spin opacity-20" />
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </AuthShell>
  );
}