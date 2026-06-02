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
  Phone,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useDepartments } from "@/features/departments/api";
import { CemsSelect } from "@/components/cems/CemsSelect";

interface SignupFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: "Student" | "Organizer";
  departmentId: string;
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
    departmentId: "",
    agreeTerms: false,
  });
  const { data: departments } = useDepartments();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const password = form.password;
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const criteria = [
    { label: "At least 8 characters", met: hasMinLength },
    { label: "One uppercase letter (A-Z)", met: hasUppercase },
    { label: "One lowercase letter (a-z)", met: hasLowercase },
    { label: "One number (0-9)", met: hasNumber },
    { label: "One special character (e.g. !@#$)", met: hasSpecial },
  ];

  const score = criteria.filter((c) => c.met).length;

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

    if (score < 5) {
      toast.error("Validation Error", {
        description: "Please enter a strong password meeting all criteria.",
      });
      return;
    }

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
          phone: form.phone,
          roleName: form.role,
          departmentId: form.role === "Student" ? form.departmentId : undefined,
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
        <h1 className="text-3xl md:text-4xl font-brand font-black text-gray-900 dark:text-white tracking-tighter mb-2">
          Join CEMS.
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
          Create your account and start discovering campus experiences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-brand font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: r.value }))}
                className={`p-3.5 rounded-lg border text-left transition-all ${form.role === r.value
                    ? "border-brand bg-brand/5 shadow-sm shadow-brand/10"
                    : "border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/40 hover:border-gray-200"
                  }`}
              >
                <div
                  className={`text-xs font-brand font-black ${form.role === r.value ? "text-brand" : "text-gray-700 dark:text-gray-300"
                    }`}
                >
                  {r.label}
                </div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
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
            className="text-[10px] font-brand font-black uppercase tracking-widest text-gray-500 dark:text-gray-400"
          >
            Full Name
          </label>
          <div className="relative">
            <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 group-focus-within:text-brand transition-colors" />
            <input
              id="signup-name"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Abebe Bekele"
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand/30 dark:focus:bg-black transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="text-[10px] font-brand font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 "
          >
            University Email
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 group-focus-within:text-brand transition-colors" />
            <input
              id="signup-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@aastu.edu.et"
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand/30 dark:focus:bg-black transition-all"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-phone"
            className="text-[10px] font-brand font-black uppercase tracking-widest text-gray-500 dark:text-gray-400"
          >
            Phone Number
          </label>
          <div className="relative">
            <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 group-focus-within:text-brand transition-colors" />
            <input
              id="signup-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+251 9XX XXX XXX"
              className="w-full pl-10 pr-4 py-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand/30 dark:focus:bg-black transition-all"
            />
          </div>
        </div>
        
        {/* Department Selection (Only for Students) */}
        {form.role === "Student" && (
          <CemsSelect
            label="Department"
            placeholder="Select your department"
            value={form.departmentId}
            onValueChange={(val: any) => setForm(p => ({ ...p, departmentId: val || "" }))}
            options={departments?.map(dept => ({ value: dept.id, label: dept.name })) || []}
            className="animate-in slide-in-from-top-2 duration-300"
          />
        )}

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="text-[10px] font-brand font-black uppercase tracking-widest text-gray-500 dark:text-gray-400"
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
              className="w-full pl-10 pr-12 py-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand/30 dark:focus:bg-black transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          
          {password && (
            <div className="space-y-2 mt-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-brand font-black uppercase tracking-wider text-brand">
                  Password Strength: {
                    score <= 2 ? "Weak" :
                    score === 3 ? "Fair" :
                    score === 4 ? "Good" :
                    "Strong"
                  }
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-1.5 h-1">
                {[1, 2, 3, 4].map((index) => {
                  let isFilled = false;
                  if (score <= 2 && index === 1) isFilled = true;
                  else if (score === 3 && index <= 2) isFilled = true;
                  else if (score === 4 && index <= 3) isFilled = true;
                  else if (score === 5 && index <= 4) isFilled = true;

                  return (
                    <div
                      key={index}
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFilled
                          ? "bg-brand shadow-xs shadow-brand/20"
                          : "bg-brand/10 dark:bg-gray-800"
                      }`}
                    />
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                {criteria.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 transition-colors duration-200"
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                        c.met
                          ? "border-brand bg-brand/5 text-brand"
                          : "border-gray-200 dark:border-gray-800 text-gray-300"
                      }`}
                    >
                      {c.met ? (
                        <Check size={9} className="stroke-3" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-medium transition-colors duration-200 ${
                        c.met ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-confirm"
            className="text-[10px] font-brand font-black uppercase tracking-widest text-gray-500 dark:text-gray-400"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              id="signup-confirm"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand/30 dark:focus:bg-black transition-all"
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
          <label htmlFor="agree-terms" className="text-xs text-gray-500 dark:text-gray-400 font-medium cursor-pointer leading-relaxed">
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
          className="group relative w-full flex items-center justify-center gap-3 bg-brand hover:bg-brand-hover text-white font-brand font-black text-[10px] uppercase tracking-[0.15em] py-4 rounded-lg shadow-xl shadow-brand/20 transition-all disabled:opacity-70 overflow-hidden mt-2"
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
      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center font-medium">
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
