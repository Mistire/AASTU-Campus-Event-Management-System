"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ElementType } from "react";

/* ─── CemsSelect ─────────────────────────────────────────────────── */
interface CemsSelectProps extends React.ComponentPropsWithoutRef<typeof Select> {
  label?: string;
  placeholder?: string;
  icon?: ElementType;
  className?: string;
  triggerClassName?: string;
  options?: { value: string; label: string }[];
}

export function CemsSelect({
  label,
  placeholder,
  icon: Icon,
  className,
  triggerClassName,
  options,
  children,
  ...props
}: CemsSelectProps) {
  // Find the selected label for display if needed
  const selectedLabel = options?.find(opt => opt.value === props.value)?.label;

  return (
    <div className={cn("w-full space-y-1.5 group", className)}>
      {label && (
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-gray-600 transition-colors px-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon 
            size={15} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 z-10 pointer-events-none group-focus-within:text-brand/50 transition-colors" 
          />
        )}
        <Select {...props}>
          <SelectTrigger 
            className={cn(
              "w-full pl-10 pr-10 py-3.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all text-left flex items-center justify-between min-h-[52px] bg-gray-50/50",
              triggerClassName
            )}
          >
            <SelectValue placeholder={placeholder}>
              {selectedLabel || undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1 z-[100] bg-white ring-1 ring-black/5 min-w-[var(--radix-select-trigger-width)]">
            {options ? (
              options.map((opt) => (
                <SelectItem 
                  key={opt.value} 
                  value={opt.value}
                  className="rounded-lg font-bold text-xs py-3 px-4 focus:bg-brand/5 focus:text-brand transition-colors cursor-pointer outline-none data-[state=checked]:bg-brand/5 data-[state=checked]:text-brand"
                >
                  {opt.label}
                </SelectItem>
              ))
            ) : children}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
