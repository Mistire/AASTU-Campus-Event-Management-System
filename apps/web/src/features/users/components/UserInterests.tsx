"use client";

import { useState, useEffect } from "react";
import {
  useMyInterests,
  useUpdateMyInterests,
  useMyCategoryPreferences,
  useUpdateMyCategoryPreferences,
} from "../api/userInterests";
import { useCategories, Category } from "@/features/categories/api";
import {
  Sparkles,
  Tag as TagIcon,
  Loader2,
  CheckCircle2,
  Bookmark,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Predefined interests are now fetched from the database

export function UserInterests() {
  const { data: myInterests, isLoading: isInterestsLoading } = useMyInterests();
  const { data: myPreferences, isLoading: isPrefsLoading } =
    useMyCategoryPreferences();
  const { data: allCategories } = useCategories();

  const updateInterests = useUpdateMyInterests();
  const updatePrefs = useUpdateMyCategoryPreferences();

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (myInterests?.selectedInterests) {
      setSelectedInterests(myInterests.selectedInterests.map((i: any) => i.id));
    }
  }, [myInterests]);

  useEffect(() => {
    if (myPreferences?.selectedCategories) {
      setSelectedCategories(
        myPreferences.selectedCategories.map((p: any) => p.id),
      );
    }
  }, [myPreferences]);

  const toggleInterest = (interestId: string) => {
    const newInterests = selectedInterests.includes(interestId)
      ? selectedInterests.filter((id) => id !== interestId)
      : [...selectedInterests, interestId];

    setSelectedInterests(newInterests);
    updateInterests.mutate(newInterests, {
      onSuccess: () => toast.success("Interests updated"),
    });
  };

  const toggleCategory = (categoryId: string) => {
    const newPrefs = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newPrefs);
    updatePrefs.mutate(newPrefs, {
      onSuccess: () => toast.success("Category preferences updated"),
    });
  };

  if (isInterestsLoading || isPrefsLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Category Preferences Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/5 rounded-lg text-brand">
            <Bookmark size={20} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 tracking-tight">
              Preferred Categories
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Help us tailor your discovery feed
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {allCategories?.map((category: Category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
                  isSelected
                    ? "bg-brand border-brand text-white shadow-brand/20 scale-105"
                    : "bg-white border-gray-100 text-gray-500 hover:border-brand/30 hover:bg-brand/5",
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Technical Interests Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/5 rounded-lg text-brand">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 tracking-tight">
              Technical Interests
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Connect with like-minded technical students
            </p>
          </div>
        </div>

        {/* Selected / Predefined Hybrid Grid */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {myInterests?.allInterests?.map((interest: any) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold transition-all border",
                    isSelected
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-white hover:border-brand/20",
                  )}
                >
                  <TagIcon
                    size={12}
                    className={
                      isSelected ? "text-emerald-500" : "text-gray-300"
                    }
                  />
                  {interest.name}
                  {isSelected && (
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
