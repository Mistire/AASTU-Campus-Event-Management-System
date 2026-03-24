"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams?.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email address...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link. Token is missing.");
            return;
        }

        const verifyEmail = async () => {
            try {
                // Not using the authenticated axios instance on purpose as this is a public route
                const res = await fetch(`http://localhost:4000/api/auth/verify-email?token=${token}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Email verification failed");
                }

                setStatus("success");
                setMessage("Email successfully verified! You can now log into your account.");
            } catch (err: any) {
                setStatus("error");
                setMessage(err.message);
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full p-8 rounded-3xl bg-white shadow-2xl border border-gray-100 text-center">
                {status === "loading" && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-16 w-16 animate-spin mb-6 text-black" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h2>
                        <p className="text-gray-500">{message}</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified!</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
                        <Link
                            href="/login"
                            className="w-full inline-flex justify-center items-center py-3.5 px-4 font-semibold rounded-xl text-white bg-black hover:bg-gray-800 transition-colors"
                        >
                            Log In to Your Account
                        </Link>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center">
                        <XCircle className="h-16 w-16 text-red-500 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-red-600 mb-8 leading-relaxed bg-red-50 p-4 rounded-xl w-full">{message}</p>
                        <Link
                            href="/signup"
                            className="w-full inline-flex justify-center items-center py-3.5 px-4 font-semibold rounded-xl text-white bg-black hover:bg-gray-800 transition-colors"
                        >
                            Return to Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <Loader2 className="animate-spin text-black h-8 w-8" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
