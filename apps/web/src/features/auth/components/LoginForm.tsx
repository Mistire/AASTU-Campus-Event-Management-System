/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowRight, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log("Login Response Data:", data);

      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      // Extract successful response data (which is wrapped in 'data' by the NestJS TransformInterceptor)
      const successData = data.data;

      if (!successData || !successData.user) {
        throw new Error("Malformed server response: User object is missing");
      }

      const userRole =
        successData.user.role ||
        (successData.user.roles && successData.user.roles[0]) ||
        "STUDENT";
      const normalizedRole =
        typeof userRole === "string" ? userRole.toUpperCase() : "STUDENT";

      setAuth(
        successData.access_token || successData.token,
        successData.refresh_token || "",
        {
          ...successData.user,
          full_name: successData.user.fullName || successData.user.full_name,
          role: normalizedRole,
        },
      );

      toast.success("Welcome back!", {
        description: `Logged in as ${normalizedRole.toLowerCase()}`,
      });

      const redirectTo = searchParams.get("redirectTo");
      const isDashboardUser = normalizedRole === "ADMIN" || normalizedRole === "ORGANIZER" || normalizedRole === "STAFF";

      console.log("[LoginForm] Redirecting user:", normalizedRole, "redirectTo:", redirectTo);

      if (isDashboardUser) {
        // Admins, Organizers and Staff should go to dashboard unless the redirectTo is specifically a dashboard route
        if (redirectTo && (redirectTo.startsWith('/dashboard') || redirectTo.startsWith('/api'))) {
          router.push(redirectTo);
        } else {
          router.push("/dashboard");
        }
      } else {
        // Students should go to discovery unless the redirectTo is a protected student route
        const isStudentRoute = redirectTo && (
          redirectTo.startsWith('/discovery') || 
          redirectTo.startsWith('/my-events') || 
          redirectTo.startsWith('/profile')
        );
        
        if (redirectTo && isStudentRoute) {
          router.push(redirectTo);
        } else {
          router.push("/discovery");
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      console.error("Login Error:", errorMessage);
      toast.error("Login Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand/8 border border-brand/10 text-brand text-[9px] font-brand font-black uppercase tracking-widest mb-6">
          <Lock size={10} />
          Secure Auth Gateway
        </div>
        <h1 className="text-3xl md:text-4xl font-brand font-black text-gray-900 dark:text-white tracking-tighter mb-3">
          Welcome back.
        </h1>
        <p className="text-gray-500 text-sm font-medium leading-relaxed">
          Sign in to your CEMS portal to manage and discover campus events.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="login-email"
            className="text-[10px] font-brand font-black uppercase tracking-widest text-gray-500"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 group-focus-within:text-brand transition-colors"
            />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@aastu.edu.et"
              required
              className="w-full pl-11 pr-4 py-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-gray-900 dark:text-white text-sm font-medium placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand/30 dark:focus:bg-black transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-[10px] font-brand font-black uppercase tracking-widest text-gray-500"
            >
              Password
            </label>
            <Link
              href="#"
              className="text-[10px] font-brand font-black text-brand hover:text-brand-hover transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 group-focus-within:text-brand transition-colors"
            />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              className="w-full pl-11 pr-12 py-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-gray-900 dark:text-white text-sm font-medium placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand/30 dark:focus:bg-black transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 rounded border-gray-200 text-brand focus:ring-brand/20"
          />
          <label
            htmlFor="remember"
            className="text-xs text-gray-500 font-medium cursor-pointer"
          >
            Keep me signed in for 7 days
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex items-center justify-center gap-3 bg-brand hover:bg-brand-hover text-white font-brand font-black text-[10px] uppercase tracking-[0.15em] py-4 rounded-lg shadow-xl shadow-brand/20 transition-all disabled:opacity-70 overflow-hidden"
        >
          <span className="relative z-10">
            {isLoading ? "Authenticating..." : "Sign In to Portal"}
          </span>
          {isLoading ? (
            <Loader2 size={14} className="animate-spin relative z-10" />
          ) : (
            <ArrowRight
              size={14}
              className="relative z-10 group-hover:translate-x-1 transition-transform"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center font-medium">
          New to CEMS?{" "}
          <Link
            href="/signup"
            className="text-brand font-bold hover:text-brand-hover transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>

      {/* Technical footnote */}
      <div className="mt-6 text-center">
        <p className="mt-8 text-center text-xs font-brand font-black uppercase tracking-widest text-brand opacity-20">
          Secure Portal Access
        </p>
      </div>
    </motion.div>
  );
}
