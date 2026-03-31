"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Music,
  PartyPopper,
  Ticket,
  Zap,
  Bell,
  Users,
  MapPin,
  LucideIcon,
} from "lucide-react";

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
  className = "",
  delay = 0,
  duration = 6,
  yOffset = 12,
  size = 24,
}: FloatingIconProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.3, 0.1, 0.3],
        y: [0, -yOffset, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
      className={`absolute pointer-events-none text-white/20 ${className}`}
    >
      <Icon size={size} strokeWidth={1} />
    </motion.div>
  );
}

export default function AuthShell({
  children,
  title,
  subtitle,
  badge,
}: {
  children: React.ReactNode;
  title: React.ReactNode;
  subtitle: string;
  badge: string;
}) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Brand Visual ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-linear-to-br from-gray-950 via-gray-900 to-brand/20 flex-col justify-between p-16">
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

        {/* Floating icons */}
        <FloatingIcon Icon={Calendar}    className="top-[12%] right-[20%]"  delay={0}   duration={7}  size={28} />
        <FloatingIcon Icon={Music}       className="top-[35%] left-[8%]"   delay={1.5} duration={9}  size={22} />
        <FloatingIcon Icon={PartyPopper} className="top-[55%] right-[12%]" delay={0.8} duration={8}  size={26} />
        <FloatingIcon Icon={Ticket}      className="bottom-[30%] left-[6%]" delay={2.5} duration={6}  size={20} />
        <FloatingIcon Icon={Zap}         className="top-[70%] right-[25%]" delay={1.2} duration={10} size={18} />
        <FloatingIcon Icon={Bell}        className="bottom-[15%] right-[8%]" delay={3}  duration={7}  size={24} />
        <FloatingIcon Icon={Users}       className="top-[20%] left-[15%]"  delay={0.5} duration={11} size={20} />
        <FloatingIcon Icon={MapPin}      className="bottom-[50%] right-[5%]" delay={4} duration={9}  size={18} />

        {/* Top: Brand Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="font-brand flex items-center tracking-tighter">
              <span className="text-white/30 font-bold text-2xl select-none">[</span>
              <span className="mx-1 text-3xl font-black bg-linear-to-r from-brand via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                CEMS
              </span>
              <span className="text-white/30 font-bold text-2xl select-none">]</span>
              <div className="ml-3 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
                </span>
                <span className="text-[9px] font-brand font-black uppercase tracking-[0.2em] text-brand/60">
                  Live
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Hero Text */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[9px] font-brand font-black uppercase tracking-widest mb-8">
            {badge}
          </div>
          <h2 className="text-4xl xl:text-5xl font-brand font-black text-white leading-[1.1] tracking-tighter mb-6">
            {title}
          </h2>
          <p className="text-white/40 text-base font-medium leading-relaxed max-w-sm">
            {subtitle}
          </p>
        </div>

        {/* Bottom: System Footer */}
        <div className="relative z-10">
          <div className="font-brand font-black text-[8px] uppercase tracking-[0.4em] text-white/20">
            [ SYS — AASTU CEMS — AUTH GATEWAY ]
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white relative overflow-hidden">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] bg-size-[40px_40px]" />
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 relative z-10">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-brand/30 font-brand font-bold text-xl">[</span>
            <span className="font-brand font-black text-2xl bg-linear-to-r from-brand to-cyan-400 bg-clip-text text-transparent">
              CEMS
            </span>
            <span className="text-brand/30 font-brand font-bold text-xl">]</span>
          </Link>
        </div>
        <div className="w-full max-w-md relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
