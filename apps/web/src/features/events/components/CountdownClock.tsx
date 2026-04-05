"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownClockProps {
  targetDate: string;
  className?: string;
}

export function CountdownClock({ targetDate, className }: CountdownClockProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  // Only show if less than 3 days away
  if (timeLeft.days > 2) return null;

  return (
    <div className={`flex items-center gap-1.5 text-brand font-black uppercase tracking-widest text-[9px] bg-brand/5 px-2 py-1 rounded-md border border-brand/10 ${className}`}>
      <Clock size={10} className="animate-pulse" />
      <span>
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
        {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
}
