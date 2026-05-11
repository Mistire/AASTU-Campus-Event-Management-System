"use client";

import { Users, TrendingUp, Building2, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SocialProofBubbleProps {
  type: "friends" | "department" | "trending" | "popular";
  count?: number;
  label?: string;
  className?: string;
}

export function SocialProofBubble({ type, count, label, className }: SocialProofBubbleProps) {
  const config = {
    friends: {
      icon: Users,
      bg: "bg-white/80 dark:bg-gray-900/80",
      text: "text-brand",
      defaultLabel: `${count} friends attending`,
    },
    department: {
      icon: Building2,
      bg: "bg-brand/10 backdrop-blur-md",
      text: "text-brand",
      defaultLabel: `${label || "Popular in your major"}`,
    },
    trending: {
      icon: TrendingUp,
      bg: "bg-amber-500/10 backdrop-blur-md",
      text: "text-amber-600",
      defaultLabel: "Trending this week",
    },
    popular: {
      icon: UserCircle2,
      bg: "bg-white/80 dark:bg-gray-900/80",
      text: "text-gray-700",
      defaultLabel: `${count} students attending`,
    },
  }[type];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 shadow-lg shadow-black/5",
        config.bg,
        config.text,
        className
      )}
    >
      <Icon size={12} className={cn("shrink-0", config.text)} />
      <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
        {label || config.defaultLabel}
      </span>
      
      {/* Mini Avatar Stack for friends/popular */}
      {(type === "friends" || type === "popular") && (
        <div className="flex -space-x-1.5 ml-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[6px] font-bold text-gray-400"
            >
              {String.fromCharCode(64 + i)}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
