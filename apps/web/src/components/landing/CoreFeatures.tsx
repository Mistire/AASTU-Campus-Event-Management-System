"use client";
import {
  Brain,
  Trophy,
  QrCode,
  CalendarClock,
  Zap,
  ArrowRight,
  Sparkle,
  Lock,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function CoreFeatures() {
  return (
    <section
      id="features"
      className="relative py-32 px-6 md:px-12 overflow-hidden bg-linear-to-b from-white via-gray-50/40 to-white"
    >
      {/* ── Background Decorations ── */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] bg-size-[50px_50px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkle size={14} className="fill-brand" />
            Core Capabilities
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tighter">
            Engineered for <span className="text-brand">Excellence.</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-xl leading-relaxed font-medium">
            CEMS powers campus events with intelligence and elite coordination.
          </p>
        </motion.div>

        {/* ── Masterclass Bento Grid ── */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr"
        >
          {/* 1. Hybrid AI Brain (Large Focus) */}
          <motion.div
            variants={item}
            className="md:col-span-2 md:row-span-2 group relative p-12 rounded-[3.5rem] bg-linear-to-br from-brand/5 via-white to-white border border-brand/10 shadow-2xl overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-8">
              <div className="font-brand font-black text-xs tracking-widest text-brand opacity-20 group-hover:opacity-100 transition-opacity">
                01 — INTELLIGENCE
              </div>
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-brand text-white flex items-center justify-center mb-10 shadow-xl shadow-brand/20 group-hover:scale-110 transition-transform duration-500">
                <Brain size={32} />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">
                Hybrid AI Brand Engine
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed max-w-md font-medium mb-12">
                Our hybrid ML-service combines content-based and collaborative
                filtering to deliver personalized discoveries based on student
                behavior.
              </p>

              {/* Micro-UI: AI Recommendations Preview */}
              <div className="flex flex-col gap-3 max-w-sm">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-gray-100 shadow-sm transition-all group-hover:translate-x-2"
                  >
                    <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-brand to-cyan-400 opacity-20" />
                    <div className="flex-1">
                      <div className="h-2 w-32 bg-gray-100 rounded-full mb-2" />
                      <div className="h-2 w-20 bg-gray-50 rounded-full" />
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-brand opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          {/* 2. Full Hackathon Lifecycle (Vertical Spotlight) */}
          <motion.div
            variants={item}
            className="md:row-span-2 group relative p-10 rounded-[3.5rem] bg-white border border-gray-100 shadow-xl overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-8">
              <div className="font-brand font-black text-[10px] tracking-widest text-brand opacity-20 group-hover:opacity-100 transition-opacity">
                02 — COMPETITION
              </div>
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                <Trophy size={28} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight leading-tight uppercase">
                Hackathon Lifecycle
              </h3>
              <p className="text-gray-500 text-base leading-relaxed font-medium mb-12">
                Specialized logic for team formation, deadlines, and
                multi-criteria judging for large competitions.
              </p>

              {/* Micro-UI: Team Preview */}
              <div className="flex items-center -space-x-3 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400"
                  >
                    U{i}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-brand text-white flex items-center justify-center text-[10px] font-black">
                  +8
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {["Innovation", "Code", "Pitch"].map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-bold text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs font-bold text-red-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                Submission: 02:44:12
              </div>
            </div>
          </motion.div>

          {/* 3. Event Access Types */}
          <motion.div
            variants={item}
            className="group relative p-10 rounded-[3.5rem] bg-white border border-gray-100 shadow-xl overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lock size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  Event Access
                </h3>
                <p className="text-gray-500 text-sm font-medium mt-1">
                  Define who gets access to your events with customizable
                  visibility settings. From open gatherings to exclusive
                  invite-only sessions, you&apos;re in full control.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-600">
                Public
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                Private
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-50 text-orange-600">
                Invite Only
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-600">
                Restricted
              </span>
            </div>
          </motion.div>

          {/* 4. Digital Entry Ecosystem (QR Focus) */}
          <motion.div
            variants={item}
            className="md:col-span-2 group relative p-10 rounded-[3.5rem] bg-linear-to-r from-gray-900 to-gray-800 text-white border border-gray-700 shadow-2xl overflow-hidden flex items-center gap-10"
          >
            <div className="flex-1 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6 backdrop-blur-xl border border-white/5">
                <QrCode size={22} />
              </div>
              <h3 className="text-2xl font-black mb-3 tracking-tight">
                Digital Entry Ecosystem
              </h3>
              <p className="text-gray-400 text-base leading-relaxed font-medium">
                Signed QR-Checkins and automated badge generation for verified
                physical attendance.
              </p>
            </div>

            {/* Micro-UI: Pulse QR */}
            <div className="hidden lg:flex items-center justify-center w-32 h-32 rounded-3xl bg-white/5 border border-white/10 relative p-4 group-hover:scale-105 transition-transform duration-500">
              <QrCode size={64} className="opacity-20 text-brand" />
              <motion.div
                animate={{ y: [0, 60, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute top-4 left-4 right-4 h-0.5 bg-brand/50 blur-[1px] shadow-[0_0_10px_rgba(14,165,233,0.5)]"
              />
            </div>
          </motion.div>

          {/* 5. Smart Scheduling Engine */}
          <motion.div
            variants={item}
            className="group relative p-10 rounded-[3.5rem] bg-white border border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-500 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
              <CalendarClock size={22} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight leading-none">
              Smart Scheduler
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed font-medium mb-6">
              Conflict detection & multi-venue validation.
            </p>

            {/* Conflict UI */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-[10px] font-black text-red-500">
              <Zap size={10} className="fill-red-500" />
              Conflict: Venue B
            </div>
          </motion.div>

          {/* 6. Live Engagement Analytics (Wide Bottom) */}
          <motion.div
            variants={item}
            className="md:col-span-2 group relative p-10 rounded-[3.5rem] bg-linear-to-br from-brand via-brand-hover to-blue-700 text-white border border-white/20 shadow-2xl overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-8">
              <Users size={100} className="text-white/5 -mr-10 -mt-10" />
            </div>

            <div className="flex items-center gap-10">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest mb-6">
                  Real-Time Engine
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight leading-tight leading-none">
                  Performance Hub
                </h3>
                <p className="text-white/80 text-lg leading-relaxed font-medium">
                  Real-time analytics for organizers to track engagement,
                  ratings, and attendance trends live.
                </p>
              </div>

              {/* Micro-UI: Sparkline */}
              <div className="hidden sm:flex items-end gap-1.5 h-20">
                {[30, 50, 40, 70, 60, 90, 85].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                    className="w-2 bg-white/20 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
