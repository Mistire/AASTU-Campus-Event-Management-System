"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useAuthStore();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-300",
        "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm",
        "hover:border-brand/30 dark:hover:border-brand/50 hover:shadow-md",
        className
      )}
      aria-label="Toggle Theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.div
            key="sun"
            initial={{ y: 10, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -10, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
            className="text-brand"
          >
            <Sun size={18} fill="currentColor" fillOpacity={0.2} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: 10, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -10, opacity: 0, rotate: -45 }}
            transition={{ duration: 0.2 }}
            className="text-brand"
          >
            <Moon size={18} fill="currentColor" fillOpacity={0.2} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
