"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2, User, Mail, GraduationCap, Send } from "lucide-react";
import { motion } from "framer-motion";

interface Department {
  id: string;
  name: string;
}

function TelegramOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null);
  const [initData, setInitData] = useState("");

  // Retrieve Telegram InitData and Pre-fill user details on client side
  useEffect(() => {
    if (typeof window === "undefined") return;

    const telegram = (window as any).Telegram;
    if (!telegram?.WebApp) {
      toast.error("Telegram Mini App context not detected.");
      return;
    }

    const webApp = telegram.WebApp;
    setInitData(webApp.initData || "");

    const tgUser = webApp.initDataUnsafe?.user;
    if (tgUser) {
      const name = `${tgUser.first_name || ""} ${tgUser.last_name || ""}`.trim();
      setFullName(name);
      if (tgUser.username) {
        setTelegramUsername(tgUser.username);
      }
    }

    // Fetch departments
    const fetchDepartments = async () => {
      try {
        const res = await apiFetch("/api/departments");
        if (!res.ok) throw new Error("Failed to fetch departments");
        const result = await res.json();
        
        // CEMS api returns wrap in result.data or result
        const list = result.data?.data || result.data || result || [];
        setDepartments(list);
      } catch (err) {
        console.error("Error loading departments:", err);
        toast.error("Could not load departments list.");
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!departmentId) {
      toast.error("Please select your department.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch("/api/auth/telegram/register", {
        method: "POST",
        body: JSON.stringify({
          initData,
          email,
          fullName,
          departmentId,
        }),
        skipAuth: true,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      // Success! Map user data to local AuthProfile schema
      const successData = result.data || result;
      const profile = {
        id: successData.user.id,
        full_name: successData.user.fullName || successData.user.full_name,
        email: successData.user.email,
        phone: successData.user.phone || "",
        role: successData.user.role,
        roles: [successData.user.role],
        user_roles: [{ role: { name: successData.user.role } }],
        profileImage: successData.user.profileImage || undefined,
      };

      setAuth(
        successData.access_token || successData.token,
        successData.refresh_token || "",
        profile
      );

      toast.success("Account setup completed!", {
        description: "Welcome to AASTU Campus Event Management System.",
      });

      // Redirect to the originally intended path
      const redirectTo = searchParams.get("redirectTo") || "/discovery";
      router.push(redirectTo);
    } catch (err: any) {
      toast.error("Setup Failed", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-gray-900 via-black to-black font-brand">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/60 p-8 backdrop-blur-xl shadow-2xl shadow-blue-500/5"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Complete Setup</h1>
          <p className="mt-2 text-sm font-medium text-gray-400">
            {telegramUsername ? `Welcome @${telegramUsername}!` : "Welcome to CEMS!"} Complete these details to finalize your profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-800 bg-gray-900/30 text-white text-sm font-medium placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Student Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@aastu.edu.et"
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-800 bg-gray-900/30 text-white text-sm font-medium placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all"
              />
            </div>
            <p className="text-[10px] text-gray-500 font-medium">
              We'll send a verification link to confirm ownership of this campus email.
            </p>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Department
            </label>
            <div className="relative">
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={isLoadingDepartments}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-800 bg-gray-900/30 text-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="" className="bg-gray-950 text-gray-500">
                  {isLoadingDepartments ? "Loading departments..." : "Select your department"}
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id} className="bg-gray-950 text-white">
                    {dept.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-500" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || isLoadingDepartments}
            className="group relative w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.15em] py-4 rounded-xl shadow-xl shadow-blue-500/10 transition-all disabled:opacity-50 overflow-hidden"
          >
            <span className="relative z-10">
              {isSubmitting ? "Finalizing Account..." : "Complete Registration"}
            </span>
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin relative z-10" />
            ) : (
              <Send className="h-3.5 w-3.5 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            )}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function TelegramOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    }>
      <TelegramOnboardingContent />
    </Suspense>
  );
}
