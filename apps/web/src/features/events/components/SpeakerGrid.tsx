"use client";

import { motion } from "framer-motion";
import { Users, Mail, Building2, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeakerGridProps {
  sessions: any[];
  allSpeakers: any[];
  isLoading?: boolean;
}

export function SpeakerGrid({ sessions, allSpeakers, isLoading }: SpeakerGridProps) {
  // 1. Create specialized sessions map for lookup
  const speakerSessionMap = new Map<string, string[]>();
  sessions?.forEach(session => {
    session.speakers?.forEach((s: any) => {
        const sid = s.speakerId || s.speaker?.id;
        if (!sid) return;
        const current = speakerSessionMap.get(sid) || [];
        if (!current.includes(session.title)) {
            speakerSessionMap.set(sid, [...current, session.title]);
        }
    });
  });

  // 2. Build the final list from allSpeakers, enriched with session info
  const displaySpeakers = (allSpeakers || []).map(s => ({
    ...s,
    sessionTitles: speakerSessionMap.get(s.id) || []
  }));

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
            <Users className="animate-pulse text-brand/20 h-10 w-10" />
        </div>
    );
  }

  if (displaySpeakers.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/50">
         <Users className="mx-auto mb-4 opacity-20 text-brand" size={48} />
         <p className="text-sm font-black uppercase tracking-widest text-gray-400">No speakers available yet</p>
         <p className="text-xs mt-1 italic font-medium">Create a speaker profile to start building your roster.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {displaySpeakers.map((speaker, index) => (
        <motion.div
          key={speaker.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          viewport={{ once: true }}
          className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-1 shadow-sm hover:shadow-2xl hover:shadow-brand/5 transition-all duration-500 overflow-hidden"
        >
          {/* Avatar Area */}
          <div className="relative aspect-square overflow-hidden rounded-[2.2rem] bg-gray-50">
            {speaker.profileImage ? (
              <img 
                src={speaker.profileImage} 
                alt={speaker.fullName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-black text-brand/10 uppercase">
                    {speaker.fullName[0]}
                </div>
            )}

            {/* Session Count Badge (Only if assigned) */}
            {speaker.sessionTitles.length > 0 ? (
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3 border border-white/20 shadow-xl translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-[8px] font-black uppercase tracking-widest text-brand mb-1">Assigned Sessions</p>
                    <div className="flex flex-wrap gap-1">
                        {speaker.sessionTitles.map((title: string) => (
                            <span key={title} className="text-[7px] font-bold text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded-md truncate max-w-full">
                                {title}
                            </span>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="absolute top-4 right-4 bg-gray-900/40 backdrop-blur-sm text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                    Unassigned
                </div>
            )}
          </div>

          <div className="p-6 space-y-3">
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="text-xl font-black text-gray-900 group-hover:text-brand transition-colors tracking-tight">
                        {speaker.fullName}
                    </h4>
                    {speaker.organization && (
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">
                            <Building2 size={10} className="text-brand/40" />
                            <span>{speaker.organization}</span>
                        </div>
                    )}
                </div>
            </div>

            {speaker.bio && (
                  <div className="relative">
                    <Quote className="absolute -top-1 -left-2 text-brand/10 rotate-180" size={24} />
                    <p className="text-xs text-gray-500 leading-relaxed font-medium italic line-clamp-3 pl-4 border-l-2 border-brand/10">
                        {speaker.bio}
                    </p>
                  </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
