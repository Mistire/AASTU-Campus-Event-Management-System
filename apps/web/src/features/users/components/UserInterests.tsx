"use client";

import { useState, useEffect } from "react";
import { 
  useMyInterests, 
  useUpdateMyInterests, 
  useMyCategoryPreferences, 
  useUpdateMyCategoryPreferences 
} from "../api/userInterests";
import { useCategories, Category } from "@/features/categories/api";
import { 
  Sparkles, 
  Tag as TagIcon, 
  Plus, 
  X, 
  Loader2, 
  CheckCircle2,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const PREDEFINED_INTERESTS = [
  "AI & Machine Learning",
  "Web Development",
  "Mobile App Dev",
  "UI/UX Design",
  "CyberSecurity",
  "Data Science",
  "Blockchain",
  "Entrepreneurship",
  "Product Management",
  "Cloud Computing"
];

export function UserInterests() {
  const { data: myInterests, isLoading: isInterestsLoading } = useMyInterests();
  const { data: myPreferences, isLoading: isPrefsLoading } = useMyCategoryPreferences();
  const { data: allCategories } = useCategories();
  
  const updateInterests = useUpdateMyInterests();
  const updatePrefs = useUpdateMyCategoryPreferences();
  
  const [customInterest, setCustomInterest] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (myInterests?.interests) {
      setSelectedInterests(myInterests.interests);
    }
  }, [myInterests]);

  useEffect(() => {
    if (myPreferences) {
      setSelectedCategories(myPreferences.map((p: any) => p.categoryId));
    }
  }, [myPreferences]);

  const toggleInterest = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    
    setSelectedInterests(newInterests);
    updateInterests.mutate(newInterests, {
        onSuccess: () => toast.success("Interests updated")
    });
  };

  const addCustomInterest = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!customInterest.trim() || selectedInterests.includes(customInterest.trim())) return;
    
    const newInterests = [...selectedInterests, customInterest.trim()];
    setSelectedInterests(newInterests);
    updateInterests.mutate(newInterests, {
        onSuccess: () => {
            toast.success(`Added "${customInterest}"`);
            setCustomInterest("");
        }
    });
  };

  const toggleCategory = (categoryId: string) => {
    const newPrefs = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newPrefs);
    updatePrefs.mutate(newPrefs, {
        onSuccess: () => toast.success("Category preferences updated")
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
          <div className="p-2 bg-brand/5 rounded-xl text-brand">
            <Bookmark size={20} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 tracking-tight">Preferred Categories</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Help us tailor your discovery feed</p>
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
                  "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
                  isSelected 
                    ? "bg-brand border-brand text-white shadow-brand/20 scale-105" 
                    : "bg-white border-gray-100 text-gray-500 hover:border-brand/30 hover:bg-brand/5"
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
          <div className="p-2 bg-brand/5 rounded-xl text-brand">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 tracking-tight">Technical Interests</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Connect with like-minded technical students</p>
          </div>
        </div>

        {/* Selected / Predefined Hybrid Grid */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_INTERESTS.map(interest => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all border",
                    isSelected 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                      : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-white hover:border-brand/20"
                  )}
                >
                  <TagIcon size={12} className={isSelected ? "text-emerald-500" : "text-gray-300"} />
                  {interest}
                  {isSelected && <CheckCircle2 size={12} className="text-emerald-500" />}
                </button>
              );
            })}
          </div>

          {/* Custom Tag Input */}
          <div className="flex flex-wrap gap-2 items-center p-4 bg-gray-50/50 rounded-[24px] border border-gray-100 border-dashed">
            <form onSubmit={addCustomInterest} className="flex-1 min-w-[200px] flex items-center gap-2">
               <Input 
                 placeholder="Type custom interest..." 
                 value={customInterest}
                 onChange={(e) => setCustomInterest(e.target.value)}
                 className="bg-transparent border-none focus-visible:ring-0 text-[11px] font-bold placeholder:text-gray-300 h-8"
               />
               <Button 
                 type="submit" 
                 variant="ghost" 
                 size="sm" 
                 className="h-8 w-8 p-0 rounded-lg text-brand hover:bg-brand/10"
               >
                 <Plus size={16} />
               </Button>
            </form>
            
            <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block" />

            <AnimatePresence>
                {selectedInterests.filter(i => !PREDEFINED_INTERESTS.includes(i)).map(interest => (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    key={interest}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm text-[10px] font-black uppercase text-gray-500 group"
                  >
                    {interest}
                    <button 
                      onClick={() => toggleInterest(interest)}
                      className="text-gray-300 hover:text-red-500 p-0.5 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
