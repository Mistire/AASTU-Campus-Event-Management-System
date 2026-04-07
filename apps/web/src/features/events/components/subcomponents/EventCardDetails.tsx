import { Bookmark, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Event } from "../../api/useEvents";

interface EventCardDetailsProps {
  event: Event;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
}

export function EventCardDetails({ event, isSaved, onToggleSave }: EventCardDetailsProps) {
  const startTime = new Date(event.startTime);
  const day = format(startTime, "dd");
  const month = format(startTime, "MMM");
  const isLive = event.status?.statusName === "LIVE";

  return (
    <div className="flex gap-5">
      {/* Left: Date Block */}
      <div className="flex flex-col items-center justify-center w-16 h-20 rounded-2xl bg-gray-50 border border-gray-100 shrink-0 group-hover:bg-brand/5 group-hover:border-brand/10 transition-colors">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-brand/60 transition-colors">{month}</span>
        <span className="text-2xl font-black text-gray-900 group-hover:text-brand transition-colors">{day}</span>
        {isLive && (
          <div className="mt-1 flex items-center">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
            </span>
          </div>
        )}
      </div>

      {/* Center: Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3 className="text-lg font-black text-gray-900 leading-tight truncate group-hover:text-brand transition-colors">
              <Link href={`/events/${event.id}`} className="after:absolute after:inset-0 after:z-0">
                {event.title}
              </Link>
            </h3>
            
            <button 
              onClick={onToggleSave}
              className={cn(
                "relative z-10 p-2 rounded-xl transition-all border shrink-0",
                isSaved 
                  ? "bg-brand/10 border-brand/20 text-brand scale-110" 
                  : "bg-gray-50 border-gray-100 text-gray-300 hover:text-brand hover:border-brand/20"
              )}
            >
              <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} strokeWidth={isSaved ? 0 : 2} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 truncate">
              <MapPin size={12} className="text-gray-400" />
              <span>{event.venue?.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <Calendar size={12} className="text-gray-400" />
              <span>{format(startTime, "h:mm a")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
