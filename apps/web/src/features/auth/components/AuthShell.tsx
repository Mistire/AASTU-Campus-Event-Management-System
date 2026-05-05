"use client";
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";

export default function AuthShell({
  children,
  title,
  subtitle,
  badge,
}: {
  children: React.ReactNode;
  title: React.ReactNode;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Brand Visual ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-[#111827] flex-col justify-between p-16">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[40px_40px]" />

        {/* Ambient glows */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 -left-20 w-96 h-96 bg-brand/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]"
        />

        {/* Top: Brand Logo */}
        <div className="relative z-10">
          <Logo />
        </div>

        {/* Center: Hero Text */}
        <div className="relative z-10">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[9px] font-brand font-black uppercase tracking-widest mb-8">
              {badge}
            </div>
          )}
          <h2 className="text-4xl xl:text-5xl font-brand font-black text-white leading-[1.1] tracking-tighter mb-6">
            {title}
          </h2>
          <p className="text-white/40 text-base font-medium leading-relaxed max-w-sm">
            {subtitle}
          </p>
        </div>

        {/* Bottom: Sidebar Footer Area (Empty for cleaner look) */}
        <div className="relative z-10" />
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white relative overflow-hidden">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] bg-size-[40px_40px]" />
        
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 relative z-10">
          <Logo />
        </div>
        
        <div className="w-full max-w-md relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
