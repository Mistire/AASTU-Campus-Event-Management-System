"use client";

import { Calendar, MapPin, Users, Building2, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
}

function InfoCard({ icon: Icon, label, value, subValue, className }: InfoCardProps) {
  return (
    <div className={cn("p-6 rounded-3xl bg-white border border-gray-100 shadow-sm transition-all hover:bg-brand/5 hover:border-brand/10 group", className)}>
      <div className="flex flex-col gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand/10 group-hover:text-brand transition-all">
          <Icon size={20} />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{label}</p>
          <p className="text-sm font-black text-gray-900 group-hover:text-brand transition-colors">{value}</p>
          {subValue && (
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface EventInfoGridProps {
  startTime: string;
  endTime: string;
  venueName: string;
  organizerName: string;
  capacity: number;
  registrations: number;
}

export function EventInfoGrid({ 
  startTime, 
  endTime, 
  venueName, 
  organizerName, 
  capacity, 
  registrations 
}: EventInfoGridProps) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <InfoCard 
        icon={Calendar} 
        label="Date" 
        value={format(start, "MMM d, yyyy")} 
        subValue={format(start, "EEEE")} 
      />
      <InfoCard 
        icon={Clock} 
        label="Time" 
        value={`${format(start, "h:mm a")} - ${format(end, "h:mm a")}`} 
        subValue={`${Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60))} Hours Duration`} 
      />
      <InfoCard 
        icon={MapPin} 
        label="Venue" 
        value={venueName} 
        subValue="Campus Center" 
      />
      <InfoCard 
        icon={Users} 
        label="Capacity" 
        value={`${registrations} / ${capacity}`} 
        subValue={`${capacity - registrations} Spots Left`}
        className={registrations >= capacity ? "bg-red-50/50" : ""}
      />
    </div>
  );
}
