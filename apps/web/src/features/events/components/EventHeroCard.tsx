"use client";

import { motion } from "framer-motion";
import { 
  ArrowUpRight, 
  Bookmark,
  MapPin,
  Calendar,
  Circle
} from "lucide-react";
import Image from "next/image";
import { Event, getThumbnailUrl } from "../api/useEvents";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

interface EventHeroCardProps {
  event: Event;
  isSaved?: boolean;
}

export function EventHeroCard({ event, isSaved: initialIsSaved }: EventHeroCardProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const startTime = new Date(event.startTime);
  const isLive = event.status?.statusName === "LIVE";

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const thumbnailUrl = getThumbnailUrl(event);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative w-[85vw] sm:w-[500px] aspect-[1.8/1] rounded-2xl overflow-hidden bg-gray-950 border border-white/10 shadow-2xl transition-all duration-300 shrink-0"
    >
      {/* Absolute Background Image with Clear Gradient */}
      <div className="absolute inset-0 z-0">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={event.title}
            fill
            className="object-cover opacity-50"
            sizes="(max-width: 640px) 85vw, 500px"
            priority
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-brand/30 to-gray-950" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-950/20 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-gray-950/60 via-transparent to-transparent" />
      </div>

      <Link
        href={`/events/${event.id}`}
        className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-white z-10"
      >
        {/* Top: Minimal Signals */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xl text-[8px] font-black uppercase tracking-[0.2em]">
              {isLive ? (
                <span className="flex items-center gap-1.5 text-red-400">
                  <Circle size={8} fill="currentColor" className="animate-pulse" />
                  Live Primary
                </span>
              ) : (
                <span className="text-white/70">Spotlight</span>
              )}
            </div>
            {event.eventCategories?.[0] && (
              <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-subtle">
                {event.eventCategories[0].category.name}
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            className={cn(
              "p-3 rounded-2xl transition-all border shrink-0 backdrop-blur-2xl",
              isSaved
                ? "bg-brand border-brand text-white shadow-lg shadow-brand/40 scale-105"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
            )}
          >
            <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} strokeWidth={isSaved ? 0 : 2} />
          </button>
        </div>

        {/* Bottom: Massive Typography */}
        <div className="space-y-4">
          <div className="space-y-2 max-w-lg">
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-[1.1] group-hover:text-brand-subtle transition-colors drop-shadow-lg">
              {event.title}
            </h3>
            <p className="text-white/50 text-sm sm:text-base font-medium line-clamp-2 leading-relaxed">
              {event.description || "Be part of this exclusive campus event designed for our students."}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Venue</span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold">
                  <MapPin size={14} className="text-brand-subtle" />
                  <span className="truncate max-w-[120px]">{event.venue?.name}</span>
                </div>
              </div>
              
              <div className="w-px h-6 bg-white/10" />

              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Schedule</span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold">
                  <Calendar size={14} className="text-brand-subtle" />
                  <span>{format(startTime, "MMM d, h:mm a")}</span>
                </div>
              </div>
            </div>

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand text-white flex items-center justify-center shadow-xl shadow-brand/20 group-hover:scale-110 transition-all duration-300 shrink-0">
              <ArrowUpRight size={24} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
