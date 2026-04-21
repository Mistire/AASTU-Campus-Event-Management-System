import { Tag as TagIcon, Layers, Hash, Check } from "lucide-react";
import { useCategories } from "@/features/categories/api";
import { useTags } from "@/features/tags/api";
import { cn } from "@/lib/utils";
import { EventFormData } from "../EventCreateWizard";
import { WizardSection } from "../wizard/WizardSection";

interface CategorizationStepProps {
  data: EventFormData;
  onUpdate: (data: Partial<EventFormData>) => void;
}

export function CategorizationStep({ data, onUpdate }: CategorizationStepProps) {
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: tags, isLoading: loadingTags } = useTags();

  const toggleCategory = (id: string) => {
    const current = data.categoryIds || [];
    const updated = current.includes(id)
      ? current.filter((c: string) => c !== id)
      : [...current, id];
    onUpdate({ categoryIds: updated });
  };

  const toggleTag = (id: string) => {
    const current = data.tagIds || [];
    const updated = current.includes(id)
      ? current.filter((t: string) => t !== id)
      : [...current, id];
    onUpdate({ tagIds: updated });
  };

  return (
    <div className="space-y-12">
      {/* Categories Section */}
      <WizardSection 
        icon={Layers} 
        title="Industry Categories" 
        subtitle="Primary groupings for discovery"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {loadingCategories ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-gray-50 animate-pulse" />
            ))
          ) : (
            categories?.map((category) => {
              const isSelected = data.categoryIds?.includes(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 text-left group",
                    isSelected 
                      ? "bg-brand border-brand text-white shadow-lg shadow-brand/20 translate-y-[-2px]" 
                      : "bg-white border-gray-100 text-gray-600 hover:border-brand/30 hover:bg-brand/5"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      isSelected ? "text-white/80" : "text-gray-400 group-hover:text-brand/70"
                    )}>
                      Category
                    </span>
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm font-black mt-1 leading-tight">{category.name}</span>
                </button>
              );
            })
          )}
        </div>
      </WizardSection>

      {/* Tags Section */}
      <WizardSection 
        icon={TagIcon} 
        title="Metadata Tags" 
        subtitle="Keywords for search optimization"
      >
        <div className="flex flex-wrap gap-3">
          {loadingTags ? (
             Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-10 w-24 rounded-xl bg-gray-50 animate-pulse" />
             ))
          ) : (
            tags?.map((tag) => {
            const isSelected = data.tagIds?.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "px-6 py-3 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all duration-300",
                  isSelected
                    ? "bg-brand border-brand text-white shadow-lg shadow-brand/20 scale-105"
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Hash size={12} className={isSelected ? "text-brand" : "text-gray-300"} />
                  {tag.name}
                </span>
              </button>
            );
          })
        )}
      </div>
    </WizardSection>
  </div>
);
}
