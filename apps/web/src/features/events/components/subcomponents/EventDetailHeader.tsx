import { ChevronLeft, Pencil } from "lucide-react";
import { CemsButton } from "@/components/cems/CemsButton";

interface EventDetailHeaderProps {
  title: string;
  onBack: () => void;
  onEdit?: () => void;
  canEdit: boolean;
}

export function EventDetailHeader({ title, onBack, onEdit, canEdit }: EventDetailHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm p-6 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-5">
        <button
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm transition-all active:scale-95 text-gray-600 dark:text-gray-400 hover:text-brand"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">
            <span>Dashboard</span>
            <span className="text-gray-200">/</span>
            <span className="text-brand">Event Details</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">{title}</h1>
        </div>
      </div>
      {canEdit && (
        <div className="flex items-center gap-3">
          <CemsButton 
            onClick={onEdit}
            cemsVariant="brand" 
            className="font-black rounded-lg text-xs uppercase tracking-widest px-8 py-4 h-auto items-center gap-2 shadow-xl shadow-brand/20 transition-all active:scale-95 group"
          >
            <Pencil size={16} className="group-hover:rotate-12 transition-transform" />
            Edit Event
          </CemsButton>
        </div>
      )}
    </div>
  );
}
