import { Suspense } from 'react';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<Loader2 className="animate-spin text-black h-8 w-8" />}>
                <SignupForm />
            </Suspense>
        </div>
    );
}
