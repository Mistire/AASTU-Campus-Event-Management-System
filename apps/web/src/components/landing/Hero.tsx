"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
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
  Ticket,
  Bell,
  Users,
  LucideIcon,
} from "lucide-react";

// ─── Floating Icon Component ────────────────────────────────────────────────
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
        "absolute pointer-events-none text-brand",
        className
      )}
    >
      <Icon size={size} strokeWidth={1.2} />
    </motion.div>
  );
}


const leftImages = ["/imh1.webp", "/imh2.jpg", "/imh3.jpg"];
const centerImages = ["/imh4.avif", "/imh7.jpg", "imh6.webp"];
const rightImages = ["/imh5.jpg", "/imh8.jpg", "/imh9.png"];

// ─── Hero Component ────────────────────────────────────────────────────────
export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % leftImages.length);
    }, 3000); // change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-gradient-to-b from-sky-100 via-white to-white pt-32 pb-24 px-6 text-center overflow-hidden">

      {/* Floating Icons */}
      <FloatingIcon Icon={Music} className="top-[12%] left-[6%]" />
      <FloatingIcon Icon={Ticket} className="top-[30%] left-[4%]" />
      <FloatingIcon Icon={PartyPopper} className="top-[8%] right-[8%]" />
      <FloatingIcon Icon={Heart} className="bottom-[20%] right-[6%]" />
      <FloatingIcon Icon={Calendar} className="bottom-[8%] right-[28%]" />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* TITLE */}
        <h1 className="text-5xl md:text-7xl font-black mb-6 text-gray-900">
          Your Campus. <br />
          <span className="text-blue-500">Your Events.</span>
        </h1>

        <p className="text-gray-500 mb-10 max-w-2xl mx-auto text-lg">
          Discover, manage, and join events easily at AASTU.
        </p>

        {/* BUTTONS */}
        <div className="flex justify-center gap-4 mb-16">
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Get Started
          </Link>

          <Link
            href="#features"
            className="border px-6 py-3 rounded-lg"
          >
            Explore
          </Link>
        </div>

        {/* ─── IMAGES (FIXED SHAPES + DYNAMIC) ───────────────────────── */}
        <div className="flex justify-center items-end -space-x-6">

          {/* LEFT IMAGE */}
          <AnimatePresence mode="wait">
            <motion.img
              key={leftImages[index]}
              src={leftImages[index]}
              className="w-[180px] md:w-[260px] h-[260px] md:h-[360px] object-cover 
              rounded-tl-[140px] rounded-tr-3xl rounded-b-3xl shadow-xl border-4 border-white"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.6 }}
            />
          </AnimatePresence>

          {/* CENTER IMAGE (TOP ROUNDED ONLY ✅ FIXED) */}
          <AnimatePresence mode="wait">
            <motion.img
              key={centerImages[index]}
              src={centerImages[index]}
              className="w-[220px] md:w-[340px] h-[300px] md:h-[460px] object-cover 
              rounded-t-[180px] rounded-b-3xl shadow-2xl border-4 border-white z-10 scale-105"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.6 }}
            />
          </AnimatePresence>

          {/* RIGHT IMAGE */}
          <AnimatePresence mode="wait">
            <motion.img
              key={rightImages[index]}
              src={rightImages[index]}
              className="w-[180px] md:w-[260px] h-[260px] md:h-[360px] object-cover 
              rounded-tr-[140px] rounded-tl-3xl rounded-b-3xl shadow-xl border-4 border-white"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.6 }}
            />
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}