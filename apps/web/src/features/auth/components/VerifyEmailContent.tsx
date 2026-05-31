"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../constants";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token.");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Email verified successfully! You can now access your account.");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed. The link may be expired.");
        }
      } catch {
        setStatus("error");
        setMessage("An error occurred while connecting to the server.");
      }
    };

    verify();
  }, [token]);

  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === "success" && countdown === 0) {
      router.push("/login");
    }
  }, [status, countdown, router]);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-8"
          >
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 text-brand animate-spin stroke-[1.5]" />
            </div>
            <h1 className="text-2xl font-brand font-black text-gray-900 dark:text-white mb-2">
              Verifying security.
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              We&apos;re validating your cryptographic token...
            </p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-brand/20 rounded-full"
                />
                <CheckCircle2 className="w-20 h-20 text-brand relative z-10 stroke-[1.5]" />
              </div>
            </div>
            
            <h1 className="text-3xl font-brand font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              Access Granted.
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed max-w-[280px] mx-auto">
              {message}
            </p>

            <Link
              href="/login"
              className="group w-full inline-flex items-center justify-center gap-3 bg-brand hover:bg-brand-hover text-white font-brand font-black py-4 rounded-lg transition-all shadow-xl shadow-brand/20 active:scale-95 mb-6"
            >
              Enter Dashboard
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <div className="text-[10px] uppercase tracking-[0.2em] font-brand font-black text-gray-300 dark:text-gray-700">
              Auto-redirect in {countdown}s
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center py-8"
          >
            <div className="flex justify-center mb-6 text-red-500">
              <XCircle className="w-20 h-20 stroke-[1.5]" />
            </div>
            
            <h1 className="text-2xl font-brand font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              Link Invalid.
            </h1>
            <p className="text-red-500/70 font-medium mb-10 leading-relaxed px-4">
              {message}
            </p>

            <div className="flex flex-col gap-4">
              <Link
                href="/login"
                className="w-full py-4 text-gray-900 dark:text-white font-brand font-black border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                Back to Login
              </Link>
              <Link
                href="/signup"
                className="text-xs font-brand font-black uppercase tracking-widest text-brand hover:text-brand-hover transition-colors"
              >
                Request New Token
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
