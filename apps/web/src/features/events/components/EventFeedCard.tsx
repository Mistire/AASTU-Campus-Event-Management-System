"use client";

import { motion } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Bookmark, 
  Users, 
  ChevronRight,
  Info
} from "lucide-react";
import { Event } from "../api/useEvents";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { SocialProofBubble } from "./SocialProofBubble";
import { CountdownClock } from "./CountdownClock";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface EventFeedCardProps {
  event: Event;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export function EventFeedCard({ event, isSaved: initialIsSaved, onToggleSave }: EventFeedCardProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  
  const startTime = new Date(event.startTime);
  const day = format(startTime, "dd");
  const month = format(startTime, "MMM");
  const isLive = event.status?.statusName === "LIVE";
  
  const capacityPercent = Math.min(100, Math.round((event._count.registrations / event.capacity) * 100));
  const isAlmostFull = capacityPercent > 85 && capacityPercent < 100;
  const isFull = capacityPercent >= 100;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    onToggleSave?.(event.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 overflow-hidden"
    >
      {/* Visual Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <Image 
          src={event.thumbnail || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800"} 
          alt={event.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          <Badge className="bg-white/90 backdrop-blur-md text-gray-900 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 shadow-xl w-fit">
             {event.eventType.name}
          </Badge>
          <SocialProofBubble 
            count={event._count.registrations} 
            type={event._count.registrations > 200 ? "trending" : "popular"} 
          />
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
           <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/80">
              <MapPin size={10} />
              <span>{event.venue?.name}</span>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
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
                  onClick={handleSave}
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

            {/* Bottom Row */}
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-1.5">
                     <Users size={12} className="text-gray-400" />
                     <span className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">
                       {event._count.registrations} registered
                     </span>
                   </div>
                   {isAlmostFull && <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Almost Full!</span>}
                   {isFull && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Full</span>}
                </div>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${capacityPercent}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      isFull ? "bg-red-500" : isAlmostFull ? "bg-amber-500" : "bg-brand"
                    )}
                  />
                </div>
              </div>

              <Button 
                className={cn(
                  "relative z-10 rounded-2xl h-10 px-5 font-black uppercase tracking-widest text-[10px] shadow-lg transition-all",
                  isFull ? "bg-gray-100 text-gray-400 shadow-none" : "bg-brand hover:bg-brand-hover text-white shadow-brand/20 hover:translate-x-1"
                )}
                disabled={isFull}
              >
                {isFull ? "Waitlist" : "Register"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements (Moved to top overlay) */}

      <div className="absolute top-4 right-16">
        <CountdownClock targetDate={event.startTime} />
      </div>
      
      {/* Hover Preview */}
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
    </motion.div>
  );
}
