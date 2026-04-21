import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info, ChevronRight } from "lucide-react";
import { Event } from "../../api/useEvents";

interface EventCardHoverPreviewProps {
  event: Event;
}

export function EventCardHoverPreview({ event }: EventCardHoverPreviewProps) {
  return (
    <HoverCard>
      <HoverCardTrigger className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 text-gray-300 hover:text-brand hover:bg-white transition-all shadow-sm opacity-0 group-hover:opacity-100">
        <Info size={14} />
      </HoverCardTrigger>
      <HoverCardContent className="w-80 rounded-2xl shadow-2xl border-gray-100 p-0 overflow-hidden">
        <div className="p-4 bg-brand/5 border-b border-brand/10">
          <h4 className="text-sm font-black text-brand uppercase tracking-widest">Event Preview</h4>
          <p className="text-lg font-black text-gray-900 leading-tight mt-1">{event.title}</p>
        </div>
        <div className="p-4 space-y-3">
           {event.sessions && event.sessions.length > 0 && (
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Key Sessions</p>
                <ul className="space-y-1.5">
                  {event.sessions.slice(0, 3).map(s => (
                    <li key={s.id} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <ChevronRight size={10} className="text-brand" />
                      <span className="truncate">{s.title}</span>
                    </li>
                  ))}
                </ul>
             </div>
           )}
           <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{event.description}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
