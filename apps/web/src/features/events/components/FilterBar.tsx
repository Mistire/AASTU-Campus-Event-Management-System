"use client";

import { useCategories } from "../api/useCategories";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, ChevronRight, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
  onFilterChange: (filters: {
    search: string;
    categoryId: string | null;
  }) => void;
  isLoading?: boolean;
}

export function FilterBar({ onFilterChange, isLoading }: FilterBarProps) {
  const { data: categories } = useCategories();
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, categoryId: selectedCategoryId });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategoryId, onFilterChange]);

  const selectCategory = (id: string | null) => {
    setSelectedCategoryId(id);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategoryId(null);
  };

  return (
    <div className="sticky top-16 z-[45] bg-gray-50/80 backdrop-blur-md border-b border-gray-100/50 py-4 mb-8">
      <div className="space-y-4">
        {/* Search & Main Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
           <div className="relative group flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={18} />
              <input
                type="text"
                placeholder="Find events, workshops, hackathons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-gray-100 bg-white text-sm font-semibold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all shadow-sm"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                  >
                    <X size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
           </div>
           
           <button className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-gray-100 text-sm font-black uppercase tracking-widest text-gray-400 hover:border-brand hover:text-brand transition-all shadow-sm shrink-0">
             <SlidersHorizontal size={16} />
             <span>Refine</span>
           </button>
        </div>

        {/* Category Horizontal Rail */}
        <div className="relative group">
           <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
             <button
                onClick={() => selectCategory(null)}
                className={cn(
                  "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                  selectedCategoryId === null
                    ? "bg-brand border-brand text-white shadow-lg shadow-brand/20"
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                )}
             >
               All Events
             </button>

             {categories?.map((cat) => (
               <button
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  className={cn(
                    "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                    selectedCategoryId === cat.id
                      ? "bg-brand border-brand text-white shadow-lg shadow-brand/20"
                      : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                  )}
               >
                 {cat.name}
               </button>
             ))}
           </div>

        </div>
      </div>
    </div>
  );
}
