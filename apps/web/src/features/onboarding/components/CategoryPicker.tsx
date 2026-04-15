"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCategories } from "@/features/events/api/useCategories";
import { useUserPreferences } from "@/features/events/api/useUserPreferences";
import { Button } from "@/components/ui/button";
import { Check, Zap, Loader2, Search, ArrowRight, Trophy, Palette, Microscope, Users2, Code2, Music2, Camera, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CategoryPickerProps {
  onComplete: () => void;
}

// TikTok-style category suggestions with icons
const PREMIUM_CATEGORIES = [
  { name: "Tech & Coding", icon: Code2, color: "from-blue-500 to-cyan-500", desc: "Workshops, Hackathons & Modern Tech" },
  { name: "Social & Fun", icon: Users2, color: "from-pink-500 to-rose-500", desc: "Parties, Mixers & Hangouts" },
  { name: "Academic", icon: Microscope, color: "from-amber-500 to-orange-500", desc: "Research, Seminars & Study" },
  { name: "Sports & Fit", icon: Trophy, color: "from-emerald-500 to-teal-500", desc: "Tournaments & Athletics" },
  { name: "Arts & Design", icon: Palette, color: "from-violet-500 to-purple-500", desc: "Exhibitions & Workshops" },
  { name: "Career", icon: Zap, color: "from-indigo-500 to-blue-500", desc: "Jobs, Networking & Future" },
  { name: "Music & Vibe", icon: Music2, color: "from-red-500 to-orange-500", desc: "Concerts, Open Mic & DJ" },
  { name: "Photography", icon: Camera, color: "from-sky-500 to-cyan-500", desc: "Shots, Edits & Galleries" },
  { name: "Startups", icon: Rocket, color: "from-lime-500 to-green-500", desc: "Ideas, Pitching & Growth" },
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
      toast.error("Process failed", {
        description: errorMessage,
      });
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
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-white overflow-hidden"
    >
      {/* ── Background: Subtle Gradients (Light matching Landing) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-brand/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] bg-size-[40px_40px] opacity-[0.4]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center min-h-screen pt-12 pb-24">
        
        {/* Header Section */}
        <motion.div 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/5 border border-brand/10 text-brand font-brand font-black uppercase tracking-[0.3em] mb-6 text-[10px]">
            <Zap size={14} className="text-brand" />
            Personalize Your Portal
          </div>
          <h1 className="text-5xl md:text-7xl font-brand font-black text-gray-900 tracking-tighter mb-4 leading-tight">
            What <span className="text-brand">Moves</span> You?
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Choose 3 or more interests to curate your campus discovery feed. 
            We&apos;ll tailor every event to your unique vibe.
          </p>
        </motion.div>

        {/* Search Field */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md mb-12 relative group"
        >
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search interests..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 focus:border-brand/40 focus:ring-4 focus:ring-brand/10 rounded-2xl py-4 pl-14 pr-6 text-gray-900 font-medium placeholder:text-gray-300 transition-all outline-none"
          />
        </motion.div>

        {/* Selection Grid */}
        <div className="w-full h-full max-h-[50vh] overflow-y-auto px-2 pb-12 scrollbar-none mask-fade">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoadingCategories ? (
               Array.from({ length: 8 }).map((_, i) => (
                 <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
               ))
            ) : filteredCategories.length === 0 ? (
               <div className="col-span-full py-20 text-center text-gray-300 font-black uppercase tracking-widest">
                  No matches found for &quot;{search}&quot;
               </div>
            ) : (
              filteredCategories.map((category, idx) => {
                const isSelected = selectedIds.includes(category.id);
                // Cycle through premium categories for icons/style if they match, or use default
                const meta = PREMIUM_CATEGORIES[idx % PREMIUM_CATEGORIES.length];
                const Icon = meta.icon;

                return (
                  <motion.button
                    key={category.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "group relative h-40 p-6 rounded-xl border-2 transition-all duration-500 overflow-hidden text-left",
                      isSelected 
                        ? "border-brand bg-brand/10 shadow-2xl shadow-brand/20 ring-4 ring-brand/10"
                        : "border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200"
                    )}
                  >
                    {/* Background Icon */}
                     <Icon className={cn(
                      "absolute -bottom-4 -right-4 w-24 h-24 transition-all duration-500",
                      isSelected ? "text-brand/10 scale-110 rotate-12" : "text-gray-100 -rotate-12"
                    )} />

                    <div className="relative z-10 flex flex-col justify-between h-full">
                       <div className={cn(
                         "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                         isSelected ? "bg-brand text-white shadow-lg" : "bg-gray-100 text-gray-400"
                       )}>
                          <Icon size={20} />
                       </div>
                       
                       <div>
                           <h3 className={cn(
                             "text-lg font-black tracking-tight leading-none mb-1.5 transition-colors",
                             isSelected ? "text-gray-900" : "text-gray-700"
                           )}>
                              {category.name}
                           </h3>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest line-clamp-1">
                              {meta.desc}
                           </p>
                       </div>
                    </div>

                    {/* Check Overlay */}
                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand flex items-center justify-center shadow-lg"
                      >
                         <Check size={14} strokeWidth={4} className="text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })
            )}
          </div>
        </div>

        {/* Bottom Bar: Action */}
        <div className="fixed bottom-0 left-0 w-full p-8 md:p-12 z-50 pointer-events-none">
           <div className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto">
              {/* Selection Count */}
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-2">
                    {selectedIds.length > 0 ? (
                      Array.from({ length: Math.min(3, selectedIds.length) }).map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-brand flex items-center justify-center text-white">
                           <Check size={16} strokeWidth={3} />
                        </div>
                      ))
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300" />
                    )}
                 </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest">
                       {selectedIds.length} Selected
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                       {selectedIds.length < 3 ? `Need ${3 - selectedIds.length} more` : "Ready to launch"}
                    </p>
                  </div>
              </div>

              {/* Continue Button */}
               <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    localStorage.setItem("cems_onboarded", "true");
                    onComplete();
                  }}
                  className="text-gray-400 hover:text-gray-950 font-black uppercase tracking-widest text-[10px]"
                >
                  Skip for now
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={isUpdating || selectedIds.length < 3}
                  className={cn(
                    "h-16 px-10 rounded-xl font-brand font-black uppercase tracking-[0.2em] text-xs flex items-center gap-4 transition-all duration-500",
                    selectedIds.length >= 3 
                      ? "bg-brand text-white shadow-xl shadow-brand/20 hover:scale-105 active:scale-95" 
                      : "bg-gray-100 text-gray-300 border border-gray-200"
                  )}
                >
                  {isUpdating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      Start Experience <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </div>
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
        .mask-fade {
          mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
        }
      `}</style>
    </motion.div>
  );
}
