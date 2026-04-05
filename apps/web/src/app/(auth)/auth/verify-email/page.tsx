import { Suspense } from "react";
import AuthShell from "@/features/auth/components/AuthShell";
import { Loader2 } from "lucide-react";
import { VerifyEmailContent } from "@/features/auth/components/VerifyEmailContent";

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title={<>Trust & <span>Verification</span>.</>}
      subtitle="Complete your registration to unlock the full potential of the CEMS ecosystem."
      badge="Security Protocol v2.4"
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