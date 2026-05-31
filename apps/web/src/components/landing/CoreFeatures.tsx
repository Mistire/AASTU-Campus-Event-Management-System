"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  QrCode,
  GraduationCap,
  Headset,
  Star,
  CalendarClock,
  Bell,
  Send,
  BookMarked,
  Lock,
  CheckCircle2,
  Zap,
  ArrowRight,
  Users,
} from "lucide-react";

type Role = "student" | "organizer";

const studentFeatures = [
  {
    icon: Brain,
    iconBg: "bg-brand/10",
    iconColor: "text-brand",
    title: "Find events you'll actually love",
    story:
      "No more scrolling through irrelevant posts. CEMS learns from what you attend and what you love — then surfaces exactly the right events for you.",
    tag: "Personalized for you",
    tagColor: "bg-brand/10 text-brand",
    micro: (
      <div className="mt-5 flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Recommended for you</p>
        {["AI & Robotics Hackathon", "Photography Workshop"].map((e, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1">{e}</span>
            <ArrowRight size={12} className="text-gray-300 shrink-0" />
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: QrCode,
    iconBg: "bg-brand/10",
    iconColor: "text-brand",
    title: "Check in with a single scan",
    story:
      "Show up, open the app, scan. Your attendance is recorded instantly — no paper lists, no waiting around, no confusion.",
    tag: "Instant entry",
    tagColor: "bg-brand/10 text-brand",
    micro: (
      <div className="mt-5 flex items-center gap-4 p-3 rounded-lg bg-gray-900 dark:bg-gray-950 border border-gray-700">
        <QrCode size={36} className="text-brand opacity-80 shrink-0" />
        <div>
          <p className="text-xs font-black text-white">Scan to Enter</p>
          <div className="flex items-center gap-1.5 mt-1">
            <CheckCircle2 size={11} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-semibold">Verified Attendee</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: GraduationCap,
    iconBg: "bg-brand/10",
    iconColor: "text-brand",
    title: "Claim your graduation passes",
    story:
      "Seniors can claim their ceremony slots, assign guest passes to family, and track everything — all in one place, no admin queues.",
    tag: "Class of 2026",
    tagColor: "bg-brand/10 text-brand",
    micro: (
      <div className="mt-5 flex flex-col gap-2">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">Your Slot</span>
          <CheckCircle2 size={14} className="text-emerald-500" />
        </div>
        <div className="flex -space-x-2">
          {["Mom", "Dad", "Sis"].map((g, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-[8px] font-black text-indigo-500">{g[0]}</div>
          ))}
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 border-2 border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-[8px] font-black text-indigo-500">+1</div>
        </div>
      </div>
    ),
  },
  {
    icon: Bell,
    iconBg: "bg-brand/10",
    iconColor: "text-brand",
    title: "Never miss what matters",
    story:
      "Get notified before events fill up, when your ticket is confirmed, or when an event you bookmarked goes live. Stay in the loop, effortlessly.",
    tag: "Stay informed",
    tagColor: "bg-brand/10 text-brand",
    micro: (
      <div className="mt-5 flex flex-col gap-1.5">
        {["Your ticket is confirmed!", "Event starts in 30 mins"].map((n, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 dark:bg-violet-500/5 border border-violet-100 dark:border-violet-500/10">
            <span className="text-[11px] text-gray-700 dark:text-gray-300 font-medium">{n}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Star,
    iconBg: "bg-brand/10",
    iconColor: "text-brand",
    title: "Your voice shapes future events",
    story:
      "After every event, share honest feedback — anonymously if you prefer. Organizers use it to improve. Your input actually matters here.",
    tag: "Anonymous & safe",
    tagColor: "bg-brand/10 text-brand",
    micro: (
      <div className="mt-5">
        <p className="text-[10px] text-gray-400 font-semibold mb-2">How was the event?</p>
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={18} className={i <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-gray-700"} />
          ))}
        </div>
        <div className="h-7 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 flex items-center">
          <span className="text-[10px] text-gray-400">Great organization! Loved it...</span>
        </div>
      </div>
    ),
  },
  {
    icon: BookMarked,
    iconBg: "bg-brand/10",
    iconColor: "text-brand",
    title: "Save events for later",
    story:
      "Spotted something interesting but not ready to commit? Bookmark it. Come back when you're ready. It'll be waiting for you.",
    tag: "Your personal list",
    tagColor: "bg-brand/10 text-brand",
    micro: (
      <div className="mt-5 flex flex-col gap-2">
        {["Tech Symposium 2026", "Data Science Bootcamp"].map((e, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{e}</span>
          </div>
        ))}
      </div>
    ),
  },
];

const organizerFeatures = [
  {
    icon: CalendarClock,
    iconBg: "bg-brand/10",
    iconColor: "text-brand",
    title: "Schedule without the headaches",
    story:
      "Pick a venue, pick a time — CEMS instantly checks for conflicts across all departments and flags overlaps before they become problems.",
    tag: "Zero scheduling conflicts",
    tagColor: "bg-brand/10 text-brand",
    micro: (
      <div className="mt-5 flex flex-col gap-2">
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
          <CheckCircle2 size={12} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Auditorium A — Available</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
          <Zap size={12} className="text-red-500 fill-red-500" />
          <span className="text-[10px] font-bold text-red-500">Venue B — Conflict Detected</span>
        </div>
      </div>
    ),
  },
  {
    icon: Users,
    iconBg: "bg-brand/10",
    iconColor: "text-brand",
    title: "Know who's actually showing up",
    story:
      "Real-time attendance tracking, registration counts, and capacity alerts. No more guessing how many chairs you need.",
    tag: "Live attendance",
    tagColor: "bg-brand/10 text-brand",
    micro: (
      <div className="mt-5">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
          <span>Registration</span>
          <span className="text-brand">84% Full</span>
        </div>
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "84%" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-brand rounded-full"
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900" />
            ))}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">+1,200 registered</span>
        </div>
      </div>
    ),
  },
  {
    icon: Lock,
    iconBg: "bg-brand/10",
    iconColor: "text-brand",
    title: "Control exactly who can attend",
    story:
      "Going department-only? Invite-only? Public? Set it once and CEMS enforces it automatically — no manual gatekeeping needed.",
    tag: "Granular access",
    tagColor: "bg-brand/10 text-brand",
    micro: (
      <div className="mt-5 flex flex-wrap gap-1.5">
        {[
          { label: "Public", color: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border-green-100 dark:border-green-500/20" },
          { label: "Private", color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20" },
          { label: "Invite Only", color: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border-orange-100 dark:border-orange-500/20" },
          { label: "Restricted", color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border-purple-100 dark:border-purple-500/20" },
        ].map((a) => (
          <span key={a.label} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${a.color}`}>{a.label}</span>
        ))}
      </div>
    ),
  },
  {
    icon: Headset,
    iconBg: "bg-brand/10",
    iconColor: "text-brand",
    title: "Handle support like a pro",
    story:
      "Students can raise tickets. You respond in real-time from a clean dashboard. Every issue tracked, every conversation logged.",
    tag: "Always responsive",
    tagColor: "bg-brand/10 text-brand",
    micro: (
      <div className="mt-5 flex flex-col gap-2">
        {[
          { id: "#92", msg: "Venue change question", status: "Active", color: "text-orange-500" },
          { id: "#91", msg: "Registration issue", status: "Resolved", color: "text-emerald-500" },
        ].map((t) => (
          <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div>
              <span className="text-[9px] font-black text-gray-400">{t.id}</span>
              <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">{t.msg}</p>
            </div>
            <span className={`text-[9px] font-black ${t.color}`}>{t.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Send,
    iconBg: "bg-brand/10",
    iconColor: "text-brand",
    title: "Reach students where they are",
    story:
      "Publish your event and it automatically goes to Telegram. No extra steps — students get notified in their preferred channel.",
    tag: "Telegram-native",
    tagColor: "bg-brand/10 text-brand",
    micro: (
      <div className="mt-5 flex items-start gap-3 p-3 rounded-xl bg-sky-50 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-500/10">
        <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
          <Send size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-black text-sky-600 dark:text-sky-400">CEMS Bot</p>
          <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">New event: "AI Summit 2026" — Register now!</p>
        </div>
      </div>
    ),
  },
];

export default function CoreFeatures() {
  const [role, setRole] = useState<Role>("student");

  const features = role === "student" ? studentFeatures : organizerFeatures;

  return (
    <section
      id="core-features"
      className="relative py-28 px-6 md:px-12 overflow-hidden bg-linear-to-b from-white dark:from-black via-gray-50/40 dark:via-gray-950 to-white dark:to-black"
    >
      {/* Background dot grid */}
      <div className="absolute inset-0 z-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] bg-size-[40px_40px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tighter">
            Built for{" "}
            <span className="text-brand">real people.</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed font-medium mb-10">
            Whether you&apos;re discovering your next favorite event or coordinating an entire campus festival — CEMS has you covered.
          </p>

          {/* Role Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {(["student", "organizer"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`relative px-8 py-2.5 rounded-lg text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                  role === r
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-gray-700"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {r === "student" ? "I'm a Student" : "I'm an Organizer"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Feature Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="group relative p-7 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.iconBg}`}>
                      <Icon size={18} className={f.iconColor} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${f.tagColor}`}>
                      {f.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight mb-2 leading-snug">
                    {f.title}
                  </h3>

                  {/* Story */}
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium flex-1">
                    {f.story}
                  </p>

                  {/* Micro UI */}
                  {f.micro}

                  {/* Hover shimmer */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-linear-to-br from-transparent via-transparent to-brand/3" />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
