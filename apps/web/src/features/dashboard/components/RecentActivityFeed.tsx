"use client";

import React from "react";
import { RecentRegistration } from "../api/getRecentRegistrations";
import { CemsBadge } from "@/components/cems/CemsBadge";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { User, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentActivityFeedProps {
  activities: RecentRegistration[];
  loading?: boolean;
}

export function RecentActivityFeed({ activities, loading }: RecentActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4 p-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-100 rounded-full w-1/3" />
              <div className="h-2 bg-gray-50 rounded-full w-1/2" />
            </div>
            <div className="w-16 h-4 bg-gray-50 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4">
            <User className="text-gray-200" size={24} />
        </div>
        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {activities.map((activity, idx) => {
        const status = activity.status.name;
        const variant =
          status === "APPROVED"
            ? "success"
            : status === "PENDING"
              ? "warning"
              : ("neutral" as const);

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-all cursor-pointer relative"
          >
            {/* User Avatar */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-lg bg-brand/5 border border-brand/10 flex items-center justify-center text-brand font-black text-sm group-hover:bg-brand group-hover:text-white transition-all shadow-sm">
                {activity.user.fullName.charAt(0)}
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                status === "APPROVED" ? "bg-emerald-500" : "bg-amber-500"
              )} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-sm font-black text-gray-900 truncate">
                  {activity.user.fullName}
                </span>
                <span className="text-[10px] font-medium text-gray-400">
                  {formatDistanceToNow(new Date(activity.registrationDate), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Calendar size={12} className="text-gray-300" />
                Registered for <span className="font-bold text-gray-700 truncate">{activity.event.title}</span>
              </p>
            </div>

            {/* Status & Action */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <CemsBadge status={variant} dot className="text-[8px] px-2 py-0.5">
                {status}
              </CemsBadge>
              <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Hover Indicator */}
            <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand rounded-r-full scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />
          </motion.div>
        );
      })}
    </div>
  );
}
