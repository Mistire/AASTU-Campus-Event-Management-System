"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const links = [
  { name: "Home", href: "/" },
  { name: "Features", href: "#core-features" },
  { name: "Support", href: "#final-cta" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for professional glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-100 w-full transition-all duration-300 px-6 md:px-12",
          scrolled 
            ? "py-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-100/50 dark:border-gray-800/50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none" 
            : "py-5 bg-transparent border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* ── Brand Logo ── */}
          <Logo />

          {/* ── Desktop Navigation ── */}
          <div className="hidden md:flex items-center gap-8 ml-10">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-brand dark:hover:text-brand transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* ── Action Buttons ── */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle className="w-9 h-9 rounded-lg" />
            <Link
              href="/login"
              className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-brand transition-colors px-4 py-2"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="group text-sm font-bold px-6 py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-white shadow-xl shadow-brand/20 transition-all active:scale-95 flex items-center gap-2"
            >
              Get Started 
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* ── Mobile Toggle ── */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle className="w-9 h-9 rounded-lg" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-brand transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      <div
        className={cn(
          "fixed inset-0 z-99 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl md:hidden transition-transform duration-500 ease-in-out px-8 pt-24",
          isOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="flex flex-col gap-6">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-white border-b border-gray-100/50 dark:border-gray-800/50 pb-4"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-4 pt-4 mt-auto mb-12">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-3.5 text-gray-900 dark:text-white font-black uppercase tracking-widest text-xs border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Login to Portal
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-3.5 bg-brand text-white font-black uppercase tracking-widest text-xs rounded-lg shadow-xl shadow-brand/20 hover:bg-brand/90 transition-all"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}