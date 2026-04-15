"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Lock,
  Mail,
  User, 
  Phone
} from "lucide-react";
import { toast } from "sonner";

interface SignupFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: "Student" | "Organizer";
  agreeTerms: boolean;
}

export function SignupForm() {
  const [form, setForm] = useState<SignupFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Student",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Validation Error", {
        description: "Passwords do not match. Please try again.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
      const res = await fetch(`${apiUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          roleName: form.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create account");
      
      toast.success("Registration Successful!", {
        description: "Please check your email to verify your account and complete your campus ID registration.",
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed";
      console.error("Signup Error:", errorMessage);
      toast.error("Registration Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roles: { value: SignupFormData["role"]; label: string; desc: string }[] =
    [
      { value: "Student", label: "Student", desc: "Discover & attend events" },
      { value: "Organizer", label: "Organizer", desc: "Create & manage events" },
    ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="h-6" />
        <h1 className="text-3xl md:text-4xl font-brand font-black text-gray-900 tracking-tighter mb-2">
          Join CEMS.
        </h1>
        <p className="text-gray-500 text-sm font-medium leading-relaxed">
          Create your account and start discovering campus experiences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-brand font-black uppercase tracking-widest text-gray-500">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: r.value }))}
                className={`p-3.5 rounded-xl border text-left transition-all ${form.role === r.value
                    ? "border-brand bg-brand/5 shadow-sm shadow-brand/10"
                    : "border-gray-100 bg-gray-50/50 hover:border-gray-200"
                  }`}
              >
                <div
                  className={`text-xs font-brand font-black ${form.role === r.value ? "text-brand" : "text-gray-700"
                    }`}
                >
                  {r.label}
                </div>
                <div className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {r.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-name"
            className="text-[10px] font-brand font-black uppercase tracking-widest text-gray-500"
          >
            Full Name
          </label>
          <div className="relative">
            <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              id="signup-name"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Abebe Bekele"
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="text-[10px] font-brand font-black uppercase tracking-widest text-gray-500"
          >
            University Email
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              id="signup-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@aastu.edu.et"
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-phone"
            className="text-[10px] font-brand font-black uppercase tracking-widest text-gray-500"
          >
            Phone Number
          </label>
          <div className="relative">
            <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              id="signup-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+251 9XX XXX XXX"
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="text-[10px] font-brand font-black uppercase tracking-widest text-gray-500"
          >
            Create Password
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              required
              className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-confirm"
            className="text-[10px] font-brand font-black uppercase tracking-widest text-gray-500"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              id="signup-confirm"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
            />
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="agree-terms"
            name="agreeTerms"
            type="checkbox"
            checked={form.agreeTerms}
            onChange={handleChange}
            required
            className="mt-0.5 w-4 h-4 rounded border-gray-200 text-brand focus:ring-brand/20"
          />
          <label htmlFor="agree-terms" className="text-xs text-gray-500 font-medium cursor-pointer leading-relaxed">
            I agree to the{" "}
            <Link href="#" className="text-brand font-bold hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-brand font-bold hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex items-center justify-center gap-3 bg-brand hover:bg-brand-hover text-white font-brand font-black text-[10px] uppercase tracking-[0.15em] py-4 rounded-xl shadow-xl shadow-brand/20 transition-all disabled:opacity-70 overflow-hidden mt-2"
        >
          <span className="relative z-10">
            {isLoading ? "Creating Account..." : "Create Account"}
          </span>
          {isLoading ? (
            <Loader2 size={14} className="animate-spin relative z-10" />
          ) : (
            <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          )}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center font-medium">
          Already have an account?{" "}
          <Link href="/login" className="text-brand font-bold hover:text-brand-hover transition-colors">
            Sign in
          </Link>
        </p>
      </div>

        <div className="h-6" />
    </motion.div>
  );
}
