"use client";

import { motion } from "framer-motion";
import { Event } from "../api/useEvents";
import { CountdownClock } from "./CountdownClock";
import { useState } from "react";
import { EventCardImage } from "./subcomponents/EventCardImage";
import { EventCardDetails } from "./subcomponents/EventCardDetails";
import { EventCardFooter } from "./subcomponents/EventCardFooter";
import { EventCardHoverPreview } from "./subcomponents/EventCardHoverPreview";

interface EventFeedCardProps {
  event: Event;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export function EventFeedCard({ event, isSaved: initialIsSaved, onToggleSave }: EventFeedCardProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  
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
      <EventCardImage event={event} />

      {/* Main Content */}
      <div className="p-6">
        <EventCardDetails 
          event={event} 
          isSaved={!!isSaved} 
          onToggleSave={handleSave} 
        />

        <div className="mt-4">
          <EventCardFooter 
            registrationsCount={event._count.registrations}
            capacity={event.capacity}
            isFull={isFull}
            isAlmostFull={isAlmostFull}
            capacityPercent={capacityPercent}
          />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-4 right-16">
        <CountdownClock targetDate={event.startTime} />
      </div>
      
      {/* Hover Preview */}
      <EventCardHoverPreview event={event} />
    </motion.div>
  );
}
