"use client";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section className="relative py-40 px-8 bg-linear-to-br from-gray-900 via-brand to-brand-hover overflow-hidden">
      
      {/* ── Background Decorations ── */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[40px_40px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand/30 rounded-full blur-[140px] opacity-40 z-0" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-brand font-black uppercase tracking-widest mb-10"
        >
          <Sparkles size={14} className="fill-white/20" />
          Join the Elite Network
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-8xl font-brand font-black text-white mb-10 tracking-tighter leading-[0.9]"
        >
          Ready to <span className="text-white/50">Elevate</span> <br />
          Your Campus <span className="underline decoration-white/20 underline-offset-8">Legacy?</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-blue-50/70 text-xl md:text-2xl mb-16 max-w-3xl mx-auto leading-relaxed font-medium"
        >
          Join thousands of AASTU students and organizers already building the 
          future of campus engagement. Your next big discovery starts here.
        </motion.p>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link
            href="/signup"
            className="group relative w-full sm:w-auto bg-white text-brand px-12 py-5 rounded-[1.8rem] shadow-2xl shadow-black/20 hover:bg-blue-50 transition-all font-brand font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 overflow-hidden"
          >
            <span className="relative z-10">GET STARTED NOW</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-brand/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Link>
          
          <Link
            href="mailto:support@cems.aastu.edu.et"
            className="w-full sm:w-auto text-white/90 px-12 py-5 rounded-[1.8rem] hover:bg-white/10 transition-all font-brand font-black text-xs uppercase tracking-[0.2em] border border-white/20 backdrop-blur-sm"
          >
            Contact Support
          </Link>
        </motion.div>

        {/* System Footer Log */}
        <div className="mt-24 pt-12 border-t border-white/10 opacity-30">
          <div className="font-brand font-black text-[9px] uppercase tracking-[0.5em] text-white">
            [ END OF LOG — VERSION 2.0.4-L — CEMS ]
          </div>
        </div>
      </div>
    </section>
  );
}
