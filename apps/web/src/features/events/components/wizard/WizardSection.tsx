import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardSectionProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}

export function WizardSection({ 
  icon: Icon, 
  title, 
  subtitle, 
  children, 
  className 
}: WizardSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand/5 flex items-center justify-center border border-brand/10">
          <Icon className="text-brand" size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">{title}</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
