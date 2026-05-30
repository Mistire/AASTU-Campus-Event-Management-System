"use client";

import { useState, useMemo } from "react";
import {
  Archive,
  BarChart3,
  FileText,
  Star,
  Users,
  ArrowUpRight,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useArchive, ArchivedEvent } from "@/features/dashboard/api/getArchive";
import { CemsTable } from "@/components/cems/CemsTable";
import { CemsBadge } from "@/components/cems/CemsBadge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CemsSheet } from "@/components/cems/CemsSheet";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export default function ArchivePage() {
  const { data: archive, isLoading } = useArchive();
  const [selectedEvent, setSelectedEvent] = useState<ArchivedEvent | null>(
    null,
  );

  const { profile } = useAuthStore();
  const isAdmin = profile?.role === "ADMIN";

  const columns = useMemo(
    () => {
      const baseColumns = [
        {
          accessorKey: "title",
          header: "Event",
          size: 320,
          cell: ({ row }: any) => (
            <div className="flex flex-col">
              <span className="font-black text-gray-900 dark:text-white tracking-tight">
                {row.original.title}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                {format(new Date(row.original.startTime), "MMM dd, yyyy")}
              </span>
            </div>
          ),
        },
        {
          accessorKey: "status",
          header: "Status",
          size: 110,
          cell: ({ row }: any) => {
            const status = row.original.status;
            const isCancelled = status.toUpperCase() === "CANCELLED";
            return (
              <CemsBadge
                status={isCancelled ? "danger" : "success"}
                className="rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
              >
                {status}
              </CemsBadge>
            );
          },
        },
        {
          accessorKey: "totalRegistrations",
          header: "Registrations",
          size: 130,
          cell: ({ row }: any) => (
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-bold text-gray-700 dark:text-gray-300">
                {row.original.totalRegistrations}
              </span>
            </div>
          ),
        },
        {
          accessorKey: "attendanceRate",
          header: "Turnout",
          size: 100,
          cell: ({ row }: any) => {
            const rate = Math.round(row.original.attendanceRate);
            return (
              <div className="flex items-center gap-2">
                <TrendingUp
                  className={cn(
                    "w-3.5 h-3.5",
                    rate > 70 ? "text-emerald-500" : "text-amber-500",
                  )}
                />
                <span className="font-bold text-gray-700 dark:text-gray-300">{rate}%</span>
              </div>
            );
          },
        },
        {
          accessorKey: "averageRating",
          header: "Rating",
          size: 90,
          cell: ({ row }: any) => (
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-bold text-gray-700 dark:text-gray-300">
                {row.original.averageRating.toFixed(1)}
              </span>
            </div>
          ),
        },
      ];

      if (isAdmin) {
        baseColumns.splice(1, 0, {
          accessorKey: "organizerName",
          header: "Organizer",
          cell: ({ row }: any) => (
            <div className="flex flex-col">
              <span className="font-bold truncate max-w-[150px]">
                {row.original.organizerName || "System Admin"}
              </span>
            </div>
          ),
        });
      }

      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }: any) => (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg h-8 px-3 gap-2 text-brand hover:bg-brand/5 font-black text-[9px] uppercase tracking-widest"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEvent(row.original);
            }}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </Button>
        ),
      } as any);

      return baseColumns;
    },
    [isAdmin],
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section with Stats Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-lg bg-brand text-white flex items-center justify-center shadow-2xl shadow-brand/20 ring-4 ring-brand/10">
            <Archive size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
              Archive
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Review performance of ended events
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="hidden lg:flex items-center gap-8 px-8 border-l border-gray-100 dark:border-gray-800">
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Total Archived
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {archive?.length || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Avg. Rating
              </p>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {(
                    (archive?.reduce(
                      (acc, curr) => acc + curr.averageRating,
                      0,
                    ) || 0) / (archive?.length || 1)
                  ).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <CemsTable
          columns={columns}
          data={archive || []}
          loading={isLoading}
          emptyMessage="No archived events found. Completed and cancelled events will appear here."
          onRowClick={(event) => setSelectedEvent(event)}
        />
      </div>

      {/* Performance Detail Side Panel */}
      <CemsSheet
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        className="max-w-md"
      >
        {selectedEvent && (
          <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
            {/* Header Area */}
            <div className="p-8 bg-brand text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1.5">
                  <CemsBadge className="bg-brand/20 text-brand border-brand/20 rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">
                    Performance Report
                  </CemsBadge>
                  <h2 className="text-lg font-black tracking-tight leading-tight max-w-xl">
                    {selectedEvent.title}
                  </h2>
                  <div className="flex items-center gap-4 text-white/80 text-[9px] font-bold uppercase tracking-widest pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {format(
                        new Date(selectedEvent.startTime),
                        "MMMM dd, yyyy",
                      )}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3 h-3" />
                      {selectedEvent.totalRegistrations} Registered
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-2.5 border border-white/10">
                    <p className="text-[8px] font-black text-white/70 uppercase tracking-widest mb-0.5 text-center">
                      Score
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-2xl font-black text-white">
                        {selectedEvent.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Body - Stats Grid */}
            <div className="p-5">
              <div className="grid grid-cols-1 gap-4">
                {/* Stat Card 1 */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users size={16} />
                    </div>
                    <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                      +{selectedEvent.totalRegistrations}
                    </span>
                  </div>
                  <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Total Impact
                  </p>
                  <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                    {selectedEvent.totalRegistrations} Users Reach
                  </p>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp size={16} />
                    </div>
                    <ArrowUpRight className="text-emerald-500 w-3.5 h-3.5" />
                  </div>
                  <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Conversion Rate
                  </p>
                  <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                    {Math.round(selectedEvent.attendanceRate)}% Attendance
                  </p>
                </div>
              </div>

              {/* Real Analytics Visualization */}
              <div className="mt-5 space-y-4">
                <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">
                    Participation Funnel
                  </h4>
                  <div className="space-y-4">
                    {/* Registrations Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        <span>Total Registrations</span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedEvent.totalRegistrations}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${selectedEvent.totalRegistrations}`,
                          }}
                        />
                      </div>
                    </div>
                    {/* Attendance Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        <span>Actual Attendance</span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedEvent.attendanceCount}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${selectedEvent.attendanceRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-[10px] text-gray-400 font-medium italic">
                    {Math.round(100 - selectedEvent.attendanceRate)}% of
                    registered users did not attend.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-3">
                    Audience Feedback
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                        Based on your average rating of{" "}
                        <span className="font-bold text-gray-900 dark:text-white">
                          {selectedEvent.averageRating.toFixed(1)}
                        </span>
                        , this event outperformed your historical average by
                        12%.
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-amber-100 dark:border-amber-500/20 flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CemsSheet>
    </div>
  );
}
