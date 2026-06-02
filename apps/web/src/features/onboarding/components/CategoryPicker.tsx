"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCategories } from "@/features/events/api/useCategories";
import { useUserPreferences } from "@/features/events/api/useUserPreferences";
import { Button } from "@/components/ui/button";
import {
  Check,
  Zap,
  Loader2,
  Search,
  ArrowRight,
  Trophy,
  Palette,
  Microscope,
  Users2,
  Code2,
  Music2,
  Camera,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CategoryPickerProps {
  onComplete: () => void;
}

const PREMIUM_CATEGORIES = [
  { name: "Tech & Coding", icon: Code2, desc: "Workshops, Hackathons & Modern Tech" },
  { name: "Social & Fun", icon: Users2, desc: "Parties, Mixers & Hangouts" },
  { name: "Academic", icon: Microscope, desc: "Research, Seminars & Study" },
  { name: "Sports & Fit", icon: Trophy, desc: "Tournaments & Athletics" },
  { name: "Arts & Design", icon: Palette, desc: "Exhibitions & Workshops" },
  { name: "Career", icon: Zap, desc: "Jobs, Networking & Future" },
  { name: "Music & Vibe", icon: Music2, desc: "Concerts, Open Mic & DJ" },
  { name: "Photography", icon: Camera, desc: "Shots, Edits & Galleries" },
  { name: "Startups", icon: Rocket, desc: "Ideas, Pitching & Growth" },
];

export function CategoryPicker({ onComplete }: CategoryPickerProps) {
  const { data: apiCategories, isLoading: isLoadingCategories } = useCategories();
  const { updatePreferences, isUpdating } = useUserPreferences();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selectedIds.length < 3) {
      toast.error("Preference required", {
        description: "Pick at least 3 to build your vibe.",
      });
      return;
    }

    try {
      await updatePreferences(selectedIds);
      localStorage.setItem("cems_onboarded", "true");
      onComplete();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save preferences";
      toast.error("Process failed", { description: errorMessage });
    }
  };

  const currentCategories = apiCategories || [];
  const filteredCategories = currentCategories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden"
    >
      {/* Clean subtle dot grid — no gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-50" />
      </div>

      {/* Scrollable body */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-4">

          {/* Header — no badge, no decorative icon, clean text only */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-7 sm:mb-10"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-brand font-black text-gray-900 tracking-tighter mb-3 leading-tight">
              What <span className="text-brand">Moves</span> You?
            </h1>
            <p className="text-gray-500 text-sm sm:text-base md:text-lg font-medium max-w-xl mx-auto">
              Choose 3 or more interests to curate your campus discovery feed.
              We&apos;ll tailor every event to your unique vibe.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-md mx-auto mb-7 sm:mb-8 relative group"
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand transition-colors"
              size={17}
            />
            <input
              type="text"
              placeholder="Search interests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-brand/50 focus:ring-4 focus:ring-brand/10 rounded-xl py-3 pl-11 pr-5 text-gray-900 font-medium placeholder:text-gray-300 transition-all outline-none text-sm"
            />
          </motion.div>

          {/* Grid — 2 cols mobile, 3 sm, 4 lg */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-4">
            {isLoadingCategories ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-28 sm:h-36 bg-gray-100 rounded-xl animate-pulse" />
              ))
            ) : filteredCategories.length === 0 ? (
              <div className="col-span-full py-16 text-center text-gray-400 font-semibold text-sm">
                No matches found for &quot;{search}&quot;
              </div>
            ) : (
              filteredCategories.map((category, idx) => {
                const isSelected = selectedIds.includes(category.id);
                const meta = PREMIUM_CATEGORIES[idx % PREMIUM_CATEGORIES.length];
                const Icon = meta.icon;

                return (
                  <motion.button
                    key={category.id}
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "group relative h-28 sm:h-36 p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 overflow-hidden text-left",
                      isSelected
                        ? "border-brand bg-brand/[0.07] shadow-md shadow-brand/10 ring-2 ring-brand/10"
                        : "border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200"
                    )}
                  >
                    {/* Watermark icon — no colour gradient */}
                    <Icon
                      className={cn(
                        "absolute -bottom-3 -right-3 w-16 h-16 sm:w-20 sm:h-20 transition-all duration-500",
                        isSelected ? "text-brand/10 rotate-6" : "text-gray-100 -rotate-6"
                      )}
                    />

                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div
                        className={cn(
                          "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-300",
                          isSelected ? "bg-brand text-white" : "bg-gray-100 text-gray-400"
                        )}
                      >
                        <Icon size={15} />
                      </div>

                      <div>
                        <h3
                          className={cn(
                            "text-sm sm:text-[15px] font-black tracking-tight leading-tight mb-0.5 transition-colors",
                            isSelected ? "text-gray-900" : "text-gray-700"
                          )}
                        >
                          {category.name}
                        </h3>
                        <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest line-clamp-1">
                          {meta.desc}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2.5 right-2.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand flex items-center justify-center shadow"
                      >
                        <Check size={11} strokeWidth={4} className="text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Fixed bottom bar — stacks on mobile, side-by-side on sm+ */}
      <div className="relative z-20 border-t border-gray-100 bg-white/95 backdrop-blur-sm px-4 sm:px-8 py-4 sm:py-5">
        <div className="max-w-5xl mx-auto flex flex-col-reverse sm:flex-row items-center justify-between gap-3">

          {/* Selection count */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
            <div className="flex -space-x-1.5">
              {selectedIds.length > 0 ? (
                Array.from({ length: Math.min(3, selectedIds.length) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-brand flex items-center justify-center text-white"
                  >
                    <Check size={12} strokeWidth={3} />
                  </div>
                ))
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-dashed border-gray-300" />
              )}
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest">
                {selectedIds.length} Selected
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {selectedIds.length < 3 ? `Need ${3 - selectedIds.length} more` : "Ready to go!"}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <Button
              variant="ghost"
              onClick={onComplete}
              className="text-gray-400 hover:text-gray-700 font-bold text-xs uppercase tracking-widest h-10 px-4"
            >
              Do this later
            </Button>
            <Button
              onClick={handleContinue}
              disabled={isUpdating || selectedIds.length < 3}
              className={cn(
                "h-11 sm:h-12 px-6 sm:px-8 rounded-xl font-brand font-black uppercase tracking-[0.15em] text-xs flex items-center gap-2 transition-all duration-300",
                selectedIds.length >= 3
                  ? "bg-brand text-white shadow-md shadow-brand/20 hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed"
              )}
            >
              {isUpdating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Start Experience <ArrowRight size={15} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
}
