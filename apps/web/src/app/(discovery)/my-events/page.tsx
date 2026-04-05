"use client";

import { motion } from "framer-motion";
import { Calendar, Search, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DiscoveryNavbar } from "@/features/discovery/components/DiscoveryNavbar";

export default function MyEventsPage() {
  return (
    <div className="min-h-screen bg-white">
      <DiscoveryNavbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="flex flex-col items-center justify-center text-center py-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-full bg-brand/5 flex items-center justify-center mb-8"
          >
            <Calendar size={40} className="text-brand/40" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-brand font-black text-gray-900 tracking-tighter mb-4"
          >
            Your Schedule is <span className="text-brand">Empty</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-md mx-auto mb-10"
          >
            You haven&apos;t registered for any events yet. Start exploring the campus feed 
            to find workshops, festivals, and more!
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/discovery">
              <Button size="lg" className="rounded-2xl h-14 px-8 bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-brand/20 flex items-center gap-3">
                <Search size={18} />
                Explore Events
                <ArrowRight size={18} />
              </Button>
            </Link>
          </motion.div>
          
          {/* Subtle decoration */}
          <div className="mt-24 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={14} className="text-brand" />
            AASTU Campus Discovery
          </div>
        </div>
      </main>
    </div>
  );
}
