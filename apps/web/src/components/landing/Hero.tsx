"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
} from "lucide-react";

// ─── Image Sets ──────────────────────────────────────────────────────────────
const leftImages = ["/imh1.webp", "/imh2.jpg", "/imh3.jpg"];
const centerImages = ["/imh4.avif", "/imh7.jpg", "/imh6.webp"];
const rightImages = ["/imh5.jpg", "/imh8.jpg", "/imh9.png"];

// ─── Hero Component ───────────────────────────────────────────────────────────
export default function Hero() {
  const [leftIdx, setLeftIdx] = useState(0);
  const [centerIdx, setCenterIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Staggered "Wave" Update Logic
      // 1. Start with Left
      setLeftIdx((prev) => (prev + 1) % leftImages.length);
      
      // 2. Offset Center
      setTimeout(() => {
        setCenterIdx((prev) => (prev + 1) % centerImages.length);
      }, 400);

      // 3. Offset Right
      setTimeout(() => {
        setRightIdx((prev) => (prev + 1) % rightImages.length);
      }, 800);
    }, 6000); // Relaxed 6-second interval

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-linear-to-b from-brand-subtle/50 dark:from-brand/10 via-white dark:via-black to-white dark:to-black pt-32 pb-24 px-6 md:px-10 text-center overflow-hidden">

      {/* ── Background: Radial Dot Grid ── */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] bg-size-[50px_50px]" />

      {/* ── Background: Moving Blobs ── */}
      {/* <motion.div
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 -left-20 w-80 h-80 bg-brand/10 rounded-full blur-3xl opacity-60 z-0"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 60, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-20 -right-20 w-96 h-96 bg-brand-subtle rounded-full blur-3xl opacity-40 z-0"
      /> */}

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Space for aesthetic balance */}
        <div className="h-10 md:h-20" />

        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-8xl font-black mb-8 text-foreground leading-[0.9] tracking-tighter"
        >
          Your Campus. <br />
          <span className="text-brand">Your Events.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-12 max-w-2xl mx-auto text-xl md:text-2xl font-medium leading-relaxed"
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
            href="/signup"
            className="group relative inline-flex items-center gap-3 bg-brand text-white px-10 py-4 rounded-lg shadow-2xl shadow-brand/30 hover:bg-brand-hover transition-all font-brand font-black text-xs uppercase tracking-widest overflow-hidden"
          >
            <span className="relative z-10">Get Started</span>
            <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Link>

          <Link
            href="#features"
            className="px-10 py-4 rounded-lg border border-border bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 text-muted-foreground font-brand font-black text-xs uppercase tracking-widest transition-all"
          >
            Explore Features
          </Link>
        </motion.div>

        {/* IMAGES — Gate formation with Dynamic Cycling */}
        <div className="flex justify-center items-end -space-x-4 md:-space-x-8 max-w-6xl mx-auto px-4 mt-20 relative">

          {/* Decorative rings */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 border-2 border-brand/20 rounded-full blur-xl" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 border-2 border-brand/10 rounded-full blur-2xl" />
          </div>

          {/* LEFT IMAGE SET */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={leftImages[leftIdx]}
                src={leftImages[leftIdx]}
                alt="Campus life left"
                className="w-[160px] md:w-[280px] h-[220px] md:h-[380px] object-cover rounded-tl-[160px] rounded-tr-lg rounded-b-lg shadow-2xl z-0 grayscale-[0.2] hover:grayscale-0 transition-all duration-700 border-4 border-white dark:border-gray-800"
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1, rotate: -2 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            </AnimatePresence>
          </div>

          {/* CENTER IMAGE SET */}
          <div className="relative z-10 scale-110">
            <AnimatePresence mode="wait">
              <motion.img
                key={centerImages[centerIdx]}
                src={centerImages[centerIdx]}
                alt="Campus life center"
                className="w-[200px] md:w-[380px] h-[280px] md:h-[480px] object-cover rounded-t-full rounded-b-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] ring-12 ring-white dark:ring-gray-800 transition-all duration-700"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            </AnimatePresence>
          </div>

          {/* RIGHT IMAGE SET */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={rightImages[rightIdx]}
                src={rightImages[rightIdx]}
                alt="Campus life right"
                className="w-[160px] md:w-[280px] h-[220px] md:h-[380px] object-cover rounded-tr-[160px] rounded-tl-lg rounded-b-lg shadow-2xl z-0 grayscale-[0.2] hover:grayscale-0 transition-all duration-700 border-4 border-white dark:border-gray-800"
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1, rotate: 2 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}