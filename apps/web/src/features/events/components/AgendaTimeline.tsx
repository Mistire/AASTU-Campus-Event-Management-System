"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { EventSession } from "../api/useEvents";
import { SpeakerChip } from "./SpeakerChip";
import { cn } from "@/lib/utils";

interface AgendaTimelineProps {
  sessions: EventSession[];
}

export function AgendaTimeline({ sessions }: AgendaTimelineProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
         <p className="text-sm font-black uppercase tracking-widest">No agenda available yet</p>
         <p className="text-xs mt-1 italic">Check back closer to the event start date.</p>
      </div>
    );
  }

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="relative pl-12 sm:pl-16 space-y-12 pb-12 overflow-hidden">
      {/* The Connecting Vertical Line */}
      <div className="absolute left-6 sm:left-8 top-8 bottom-4 w-1 bg-linear-to-b from-brand/80 via-blue-400/40 to-transparent rounded-full shadow-lg shadow-brand/10" />

      {sortedSessions.map((session, index) => {
        const isLast = index === sortedSessions.length - 1;
        const startTime = new Date(session.startTime);
        const endTime = new Date(session.endTime);
        
        // Dynamic colors based on session type
        const typeKey = (session.sessionType?.toUpperCase() || "OTHER") as keyof typeof typeColors;
        const typeColors = {
          KEYNOTE: "bg-brand ring-brand/20",
          WORKSHOP: "bg-teal-500 ring-teal-500/20",
          PANEL: "bg-purple-600 ring-purple-600/20",
          LUNCH: "bg-amber-500 ring-amber-500/20",
          OTHER: "bg-gray-400 ring-gray-400/20",
        };
        const activeColor = typeColors[typeKey] || typeColors.OTHER;

        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="relative group"
          >
            {/* The Connecting Dot (Pulsing) */}
            <div
               className={cn(
                 "absolute left-[-2.4rem] sm:-left-13 top-2 w-4 h-4 rounded-full ring-8 transition-all duration-300 z-10",
                 activeColor,
                 isLast ? "rounded-none h-4 w-4 rotate-45" : ""
               )}
            >
               {isLive(session) && (
                 <div className="absolute inset-0 rounded-full animate-ping bg-white/50" />
               )}
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              <div className="flex-1 space-y-4">
                {/* Time & Title Row */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-brand uppercase tracking-widest tabular-nums font-mono drop-shadow-sm">
                      {format(startTime, "h:mm aa")} — {format(endTime, "h:mm aa")}
                    </span>
                    {session.sessionType && (
                       <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-[8px] font-black uppercase tracking-widest text-gray-500">
                          {session.sessionType}
                       </span>
                    )}
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-brand transition-colors tracking-tight leading-tight">
                    {session.title}
                  </h4>
                </div>

                {/* Description */}
                {session.description && (
                  <p className="text-sm text-gray-500 leading-relaxed max-w-2xl font-medium">
                    {session.description}
                  </p>
                )}

                {/* Location Pill */}
                {session.location && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:bg-brand/5 group-hover:text-brand transition-colors">
                    <MapPin size={12} className="shrink-0" />
                    <span>{session.location}</span>
                  </div>
                )}
              </div>

              {/* Speaker Stack */}
              <div className="flex -space-x-4 md:space-x-0 md:flex-col md:items-end gap-x-2 gap-y-3">
                {session.speakers?.map((s) => (
                  <SpeakerChip
                    key={s.id}
                    fullName={s.speaker.fullName}
                    title={s.speaker.title}
                    bio={s.speaker.bio}
                    profileImage={s.speaker.profileImage}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function isLive(session: EventSession) {
  const now = new Date();
  return now >= new Date(session.startTime) && now <= new Date(session.endTime);
}
