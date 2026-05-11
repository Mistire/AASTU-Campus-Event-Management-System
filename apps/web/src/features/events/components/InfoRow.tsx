import { cn } from "@/lib/utils";
import React from "react";

interface InfoRowProps {
  icon: React.ElementType;
  iconClassName?: string;
  label: string;
  value: string;
  sub?: string;
  className?: string;
}

export const InfoRow = ({
  icon: Icon,
  iconClassName = "text-gray-400",
  label,
  value,
  sub,
  className,
}: InfoRowProps) => (
  <div className={cn(
    "flex items-start gap-4 p-4 rounded-lg bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white transition-all group",
    className
  )}>
    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform bg-white", iconClassName)}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
        {label}
      </p>
      <p className="text-sm font-black text-gray-900 tracking-tight truncate">{value}</p>
      {sub && <p className="text-[11px] font-bold text-gray-400 mt-0.5 truncate">{sub}</p>}
    </div>
  </div>
);
