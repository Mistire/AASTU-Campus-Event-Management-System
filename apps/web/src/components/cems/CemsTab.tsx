"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface CemsTabProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
}


export function CemsTab({ tabs, defaultValue, className }: CemsTabProps) {
  const activeTab = defaultValue || tabs[0]?.value;

  return (
    <TabsPrimitive.Root 
      defaultValue={activeTab} 
      className={cn("w-full flex flex-col", className)}
    >
      <TabsPrimitive.List 
        className="flex items-center gap-10 border-b border-gray-100 bg-gray-50/50 px-10 pt-6"
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Tab
            key={tab.value}
            value={tab.value}
            className={cn(
              "group relative flex items-center gap-2.5 pb-4 pt-1 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 outline-none",
              "text-gray-400 hover:text-gray-600",
              "data-active:text-brand"
            )}
          >
            {tab.icon && (
              <span className="w-4 h-4 opacity-50 group-hover:opacity-80 group-data-active:opacity-100 transition-opacity duration-300">
                {tab.icon}
              </span>
            )}
            
            <span className="relative z-10">{tab.label}</span>

            {/* Premium Active Indicator */}
            <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-brand transition-all duration-500 ease-out group-data-active:w-full rounded-t-full shadow-[0_-2px_8px_rgba(var(--brand-rgb),0.3)]" />
            
            {/* Subtle Hover background */}
            <div className="absolute inset-x-0 top-0 bottom-1 bg-brand/0 group-hover:bg-brand/3 rounded-t-lg transition-colors duration-300" />
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>

      <div className="flex-1 overflow-hidden relative">
        {tabs.map((tab) => (
          <TabsPrimitive.Panel
            key={tab.value}
            value={tab.value}
            className="mt-0 p-10 min-h-[400px] outline-none animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out"
          >
            {tab.content}
          </TabsPrimitive.Panel>
        ))}
      </div>
    </TabsPrimitive.Root>
  );
}
