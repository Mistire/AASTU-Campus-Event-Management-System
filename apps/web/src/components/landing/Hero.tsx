"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ArrowRight,
  Trophy,
  Music,
  Code2,
  PartyPopper,
  Heart,
  Zap,
  Coffee,
  MapPin,
  Sparkles,
  Ticket,
  Bell,
  Users,
  LucideIcon,
} from "lucide-react";

// ─── Floating Icon Component ──────────────────────────────────────────────────
interface FloatingIconProps {
  Icon: LucideIcon;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  size?: number;
}

function FloatingIcon({
  Icon,
  className,
  delay = 0,
  duration = 5,
  yOffset = 12,
  size = 28,
}: FloatingIconProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4, y: 20 }}
      animate={{
        opacity: [0, 0.35, 0.15, 0.35],
        y: [0, -yOffset, 0],
        rotate: [0, 6, -6, 0],
        scale: [1, 1.08, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={cn(
        "absolute pointer-events-none text-brand drop-shadow-[0_0_12px_rgba(14,165,233,0.3)]",
        className
      )}
    >
      <Icon size={size} strokeWidth={1.2} />
    </motion.div>
  );
}

// ─── Hero Component ───────────────────────────────────────────────────────────
export default function Hero() {
  return (
    <section className="relative bg-linear-to-b from-brand-subtle/50 via-white to-white pt-32 pb-24 px-6 md:px-10 text-center overflow-hidden">

      {/* ── Background: Radial Dot Grid ── */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] bg-size-[50px_50px]" />

      {/* ── Background: Moving Blobs ── */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 -left-20 w-80 h-80 bg-brand/10 rounded-full blur-3xl opacity-60 z-0"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 60, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-20 -right-20 w-96 h-96 bg-brand-subtle rounded-full blur-3xl opacity-40 z-0"
      />

      {/* ── Floating Event Icons ── */}
      {/* Top-left cluster */}
      <FloatingIcon Icon={Music}       className="top-[12%] left-[6%]"    delay={0}   duration={7}  yOffset={14} size={30} />
      <FloatingIcon Icon={Ticket}      className="top-[30%] left-[4%]"    delay={1.8} duration={9}  yOffset={18} size={24} />
      <FloatingIcon Icon={Code2}       className="top-[55%] left-[7%]"    delay={0.6} duration={6}  yOffset={10} size={26} />

      {/* Top-right cluster */}
      <FloatingIcon Icon={PartyPopper} className="top-[8%]  right-[8%]"   delay={0.4} duration={8}  yOffset={16} size={32} />
      <FloatingIcon Icon={Bell}        className="top-[28%] right-[5%]"   delay={2.2} duration={10} yOffset={12} size={26} />
      <FloatingIcon Icon={Sparkles}    className="top-[50%] right-[9%]"   delay={1.0} duration={5}  yOffset={8}  size={22} />

      {/* Mid-left */}
      <FloatingIcon Icon={Zap}         className="top-[70%] left-[3%]"    delay={3.0} duration={6}  yOffset={20} size={24} />

      {/* Mid-right bottom */}
      <FloatingIcon Icon={Heart}       className="bottom-[20%] right-[6%]" delay={1.5} duration={11} yOffset={14} size={28} />
      <FloatingIcon Icon={Coffee}      className="bottom-[35%] right-[14%]" delay={0.9} duration={8} yOffset={10} size={22} />

      {/* Center-top accent */}
      <FloatingIcon Icon={MapPin}      className="top-[4%] left-[48%]"    delay={4.0} duration={14} yOffset={8}  size={20} />
      <FloatingIcon Icon={Users}       className="bottom-[10%] left-[18%]" delay={2.8} duration={9}  yOffset={12} size={26} />
      <FloatingIcon Icon={Calendar}    className="bottom-[8%] right-[28%]" delay={0.2} duration={7}  yOffset={16} size={28} />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Status Capsule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-brand/10 shadow-sm mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
          </span>
          <span className="font-brand font-black text-[10px] uppercase tracking-[0.2em] text-brand">
            LIVE — POWERING 12+ CAMPUS EVENTS TODAY
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-8xl font-black mb-8 text-gray-900 leading-[0.9] tracking-tighter"
        >
          Your Campus. <br />
          <span className="text-brand">Your Events.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500 mb-12 max-w-2xl mx-auto text-xl md:text-2xl font-medium leading-relaxed"
        >
          The intelligent platform for discovering and managing
          extra-curricular excellence at AASTU.
        </motion.p>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link
            href="/login"
            className="group relative inline-flex items-center gap-3 bg-brand text-white px-10 py-4 rounded-2xl shadow-2xl shadow-brand/30 hover:bg-brand-hover transition-all font-brand font-black text-xs uppercase tracking-widest overflow-hidden"
          >
            <span className="relative z-10">Get Started</span>
            <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Link>

          <Link
            href="#features"
            className="px-10 py-4 rounded-2xl border border-gray-100 bg-white/50 backdrop-blur-sm hover:bg-white text-gray-600 font-brand font-black text-xs uppercase tracking-widest transition-all"
          >
            Explore Features
          </Link>
        </motion.div>

        {/* IMAGES — Gate formation */}
        <div className="flex justify-center items-end -space-x-4 md:-space-x-8 max-w-6xl mx-auto px-4 mt-20 relative">

          {/* Decorative rings */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 border-2 border-brand/20 rounded-full blur-xl" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 border-2 border-brand/10 rounded-full blur-2xl" />
          </div>

          <motion.img
            src="/img2.webp"
            alt="Campus life left"
            className="w-[160px] md:w-[280px] h-[220px] md:h-[380px] object-cover rounded-tl-[160px] rounded-tr-3xl rounded-b-3xl shadow-2xl z-0 grayscale-[0.2] hover:grayscale-0 transition-all duration-700 border-4 border-white"
            initial={{ opacity: 0, x: -50, rotate: -5 }}
            animate={{ opacity: 1, x: 0, rotate: -2 }}
            transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
          />

          <motion.img
            src="/img3.webp"
            alt="Campus life center"
            className="w-[200px] md:w-[380px] h-[280px] md:h-[480px] object-cover rounded-t-full rounded-b-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] ring-12 ring-white z-10 scale-110 hover:scale-[1.12] transition-transform duration-700"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
          />

          <motion.img
            src="/img4.jpg"
            alt="Campus life right"
            className="w-[160px] md:w-[280px] h-[220px] md:h-[380px] object-cover rounded-tr-[160px] rounded-tl-3xl rounded-b-3xl shadow-2xl z-0 grayscale-[0.2] hover:grayscale-0 transition-all duration-700 border-4 border-white"
            initial={{ opacity: 0, x: 50, rotate: 5 }}
            animate={{ opacity: 1, x: 0, rotate: 2 }}
            transition={{ delay: 1, duration: 1, ease: "easeOut" }}
          />

          {/* Inline floating icons near images */}
          <motion.div
            animate={{ y: [0, -15, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 left-10 text-brand"
          >
            <Calendar size={32} strokeWidth={1.5} />
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 right-10 text-brand"
          >
            <Trophy size={40} strokeWidth={1.5} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
