"use client";

import React, { useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Ticket, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface MyEventsCalendarProps {
  events: any[];
  onViewTicket?: (entry: any) => void;
}

export function MyEventsCalendar({ events, onViewTicket }: MyEventsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dayEvents = selectedDay 
    ? events.filter(e => isSameDay(new Date(e.event.startTime), selectedDay))
    : [];

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-8 py-6 bg-linear-to-r from-white to-gray-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center shadow-inner">
            <CalendarIcon className="text-brand" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">
              {format(currentMonth, "MMMM")}
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              Year {format(currentMonth, "yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-lg hover:bg-gray-100 h-10 w-10"
          >
            <ChevronLeft size={20} />
          </Button>
          <div className="h-4 w-px bg-gray-100" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-lg hover:bg-gray-100 h-10 w-10"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {days.map((day) => (
          <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;
        
        const hasEvents = events.some(e => isSameDay(new Date(e.event.startTime), cloneDay));
        const isSelected = selectedDay && isSameDay(day, selectedDay);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toString()}
            onClick={() => setSelectedDay(cloneDay)}
            className={cn(
              "relative h-20 sm:h-24 border-r border-b border-gray-100 p-2 transition-all cursor-pointer group/day",
              !isCurrentMonth && "bg-gray-50/20 opacity-30",
              isSelected ? "bg-brand/5" : "hover:bg-gray-50/80",
              i === 6 && "border-r-0"
            )}
          >
            <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black transition-all",
                isToday ? "ring-2 ring-brand ring-offset-2" : "",
                isSelected ? "bg-brand text-white shadow-lg shadow-brand/30 scale-110" : "text-gray-900"
            )}>
              {formattedDate}
            </div>
            
            {hasEvents && !isSelected && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(var(--brand-rgb),0.5)]" />
                </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="bg-white">{rows}</div>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Calendar Grid */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden flex flex-col h-full">
        {renderHeader()}
        {renderDays()}
        <div className="flex-1">
          {renderCells()}
        </div>
      </div>

      {/* Selected Day Details - Premium Light Sidebar Style */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="bg-white rounded-lg p-8 text-gray-900 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden h-full min-h-[400px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 space-y-8 h-full flex flex-col">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand">Agenda for</h3>
              <p className="text-3xl font-black tracking-tight uppercase text-gray-900">
                {selectedDay ? format(selectedDay, "EEE, MMM d") : "Select a day"}
              </p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
              <AnimatePresence mode="wait">
                {dayEvents.length > 0 ? (
                  dayEvents.map((entry, idx) => {
                    const status = entry.status?.name || (entry.entryType === "waitlisted" ? "WAITLISTED" : "CONFIRMED");
                    const hasTicket = !!entry.ticketToken;

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-5 rounded-lg bg-gray-50 border border-gray-100 hover:border-brand/20 hover:bg-white transition-all group shadow-sm hover:shadow-md relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <Link href={`/events/${entry.event.id}`} className="flex-1 pr-2">
                            <h4 className="font-black text-sm group-hover:text-brand transition-colors text-gray-900">
                              {entry.event.title}
                            </h4>
                          </Link>
                          <div className={cn(
                            "px-2 py-0.5 rounded-lg font-black uppercase tracking-widest text-[7px] flex items-center gap-1 shrink-0",
                            status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : 
                            status === "PENDING" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                          )}>
                            {status === "CONFIRMED" ? <CheckCircle2 size={8} /> : <Clock size={8} />}
                            {status}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 mb-4">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            <Clock size={12} className="text-brand" />
                            {format(new Date(entry.event.startTime), "h:mm a")}
                          </div>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            <MapPin size={12} className="text-brand" />
                            <span className="truncate">{entry.event.venue?.name || "Online"}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/events/${entry.event.id}`} className="flex-1">
                            <Button 
                              variant="outline"
                              size="sm"
                              className="w-full h-8 rounded-lg border-gray-200 text-gray-500 hover:text-brand hover:border-brand font-black uppercase tracking-widest text-[8px] flex items-center justify-center gap-2"
                            >
                              <Info size={12} />
                              Details
                            </Button>
                          </Link>
                          {status === "CONFIRMED" && hasTicket && onViewTicket && (
                            <Button 
                              onClick={() => onViewTicket(entry)}
                              size="sm"
                              className="flex-1 h-8 rounded-lg bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-widest text-[8px] flex items-center justify-center gap-2"
                            >
                              <Ticket size={12} />
                              Ticket
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center mb-4">
                      <Clock size={24} className="text-gray-200" />
                    </div>
                    <p className="text-xs font-bold text-gray-300 uppercase tracking-[0.2em]">No events scheduled</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {dayEvents.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <Button className="w-full h-14 rounded-lg bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand/20">
                  View All Details
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
