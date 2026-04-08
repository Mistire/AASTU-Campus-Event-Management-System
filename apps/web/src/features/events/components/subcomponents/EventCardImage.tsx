import Image from "next/image";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SocialProofBubble } from "../SocialProofBubble";
import { Event } from "../../api/useEvents";
import { getMediaUrl } from "@/lib/api-client";

interface EventCardImageProps {
  event: Event;
}

export function EventCardImage({ event }: EventCardImageProps) {
  const imageUrl = getMediaUrl(event.thumbnail || event.media?.[0]?.fileUrl);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
      <Image 
        src={imageUrl} 
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
  );
}
