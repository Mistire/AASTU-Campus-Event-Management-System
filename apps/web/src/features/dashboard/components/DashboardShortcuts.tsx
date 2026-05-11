"use client";

import React from "react";
import {
  Plus,
  Users,
  QrCode,
  ArrowRight,
  Calendar,
  ShieldCheck,
  Zap,
  Activity,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
  CemsCard,
  CemsCardHeader,
  CemsCardContent,
} from "@/components/cems/CemsCard";

import { useTopOrganizer } from "../api/getTopOrganizer";
import Image from "next/image";

interface DashboardShortcutsProps {
  isAdmin?: boolean;
}

export function DashboardShortcuts({ isAdmin }: DashboardShortcutsProps) {
  const { profile: currentUser } = useAuthStore();
  const { data: topOrganizers, isLoading: isTopLoading } = useTopOrganizer();
  const commonActions = [
    {
      title: "New Event",
      desc: "Draft a new proposal",
      icon: Plus,
      href: "/dashboard/events/new",
      color: "bg-brand text-white shadow-brand/20",
      featured: true,
    },
  ];

  const adminActions = [
    {
      title: "Manage Users",
      desc: "Audit user permissions",
      icon: Users,
      href: "/dashboard/users",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "System Logs",
      desc: "Review audit trails",
      icon: ShieldCheck,
      href: "/dashboard/audit-logs",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const organizerActions = [
    ...commonActions,
    {
      title: "My Events",
      desc: "Manage your active list",
      icon: Calendar,
      href: "/dashboard/events",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Scanner",
      desc: "Validate guest tickets",
      icon: QrCode,
      href: "/dashboard/scanner",
      color: "bg-orange-50 text-orange-600",
    },
  ];

  const actions = isAdmin ? adminActions : organizerActions;

  return (
    <div className="space-y-6">
      <CemsCard>
        <CemsCardHeader
          icon={<Zap className="text-brand fill-brand" size={14} />}
          title="Direct Actions"
          bordered
        />
        <CemsCardContent className="p-4">
          <div className="grid grid-cols-1 gap-3">
            {actions.map((action, idx) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  href={action.href}
                  className={cn(
                    "group relative flex items-center gap-4 p-3 rounded-lg border transition-all duration-300",
                    action.featured
                      ? "bg-brand/5 border-brand/20 shadow-sm"
                      : "bg-white border-gray-100 hover:border-brand/30 hover:shadow-md",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                      action.color,
                    )}
                  >
                    <action.icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black text-gray-900 group-hover:text-brand transition-colors">
                      {action.title}
                    </p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                      {action.desc}
                    </p>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-brand group-hover:text-white transition-all">
                    <ArrowRight size={12} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </CemsCardContent>
      </CemsCard>

      <CemsCard className="relative overflow-hidden group">
        <CemsCardHeader
          icon={<Activity size={14} className="text-emerald-500" />}
          title="Activity Pulse"
          bordered
          action={
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                Live
              </span>
            </div>
          }
        />
        <CemsCardContent className="p-5 relative z-10">
          <div className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-black text-gray-900">03</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Ongoing Events
                </p>
              </div>
              <div className="h-12 flex items-end gap-1 pb-1">
                {[30, 60, 45, 90, 40, 70, 55].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 1.5,
                    }}
                    className="w-1 bg-brand/10 group-hover:bg-brand/30 rounded-full transition-colors"
                  />
                ))}
              </div>
            </div>
          </div>
        </CemsCardContent>
        {/* Subtle Background Glow */}
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/10 transition-all pointer-events-none" />
      </CemsCard>

      <CemsCard className="overflow-hidden border-none shadow-xl shadow-brand/5 to-gray-50/50">
        <CemsCardHeader className="pb-3 border-b border-gray-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-800">
                Top Organizers
              </h3>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-full">
              Ranked
            </span>
          </div>
        </CemsCardHeader>
        <CemsCardContent className="pt-4 px-4 pb-4">
          <div className="space-y-4">
            {isTopLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                    <div className="h-2 w-16 bg-gray-50 rounded" />
                  </div>
                </div>
              ))
            ) : topOrganizers && topOrganizers.length > 0 ? (
              topOrganizers.slice(0, 5).map((organizer, idx) => (
                <motion.div
                  key={organizer.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "group flex items-center justify-between p-2 rounded-xl transition-all duration-300 border",
                    currentUser?.id === organizer.userId
                      ? "bg-brand/5 border-brand/20 shadow-md shadow-brand/5"
                      : "hover:bg-white hover:shadow-md hover:shadow-brand/5 border-transparent hover:border-gray-100",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-brand/5 flex items-center justify-center text-brand border border-brand/10 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                        {organizer.profileImage ? (
                          <Image
                            src={organizer.profileImage}
                            alt={organizer.fullName}
                            fill
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-xs font-black">
                            {organizer.fullName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div
                        className={cn(
                          "absolute -top-1.5 -left-1.5 w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg border-2 border-white",
                          idx === 0
                            ? "bg-amber-400 text-amber-900"
                            : idx === 1
                              ? "bg-slate-300 text-slate-800"
                              : idx === 2
                                ? "bg-orange-300 text-orange-900"
                                : "bg-gray-100 text-gray-500",
                        )}
                      >
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-black text-gray-900 group-hover:text-brand transition-colors line-clamp-1">
                          {organizer.fullName}
                        </span>
                        {currentUser?.id === organizer.userId && (
                          <span className="text-[8px] font-black bg-brand text-white px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-sm">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          {organizer.totalEvents} Events
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-200" />
                        <span className="text-[9px] font-black text-brand/70 uppercase tracking-tighter">
                          {organizer.totalRegistrations} Registrations
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  No rankings yet
                </p>
              </div>
            )}
          </div>
        </CemsCardContent>
      </CemsCard>
    </div>
  );
}
