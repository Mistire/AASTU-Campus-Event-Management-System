"use client";

import { Activity } from "lucide-react";
import { 
  useGlobalAttendanceStats, 
  useEventsParticipation, 
  useRecentGlobalAttendance 
} from "@/features/events/api/get-attendance";
import { GlobalAttendanceStats } from "@/features/events/components/attendance/GlobalAttendanceStats";
import { GlobalPerformanceTable } from "@/features/events/components/attendance/GlobalPerformanceTable";
import { GlobalActivityFeed } from "@/features/events/components/attendance/GlobalActivityFeed";

export default function GlobalAttendancePage() {
  const { data: stats, isLoading: statsLoading } = useGlobalAttendanceStats();
  const { data: participation, isLoading: partLoading } = useEventsParticipation();
  const { data: recent, isLoading: recentLoading } = useRecentGlobalAttendance();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Attendance Dashboard</h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
          Campus-wide participation & event engagement monitoring
        </p>
      </div>

      {/* Stats Grid */}
      <GlobalAttendanceStats stats={stats} isLoading={statsLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Participation Table */}
        <GlobalPerformanceTable data={participation || []} isLoading={partLoading} />

        {/* Live Feed */}
        <GlobalActivityFeed recent={recent} isLoading={recentLoading} />
      </div>
    </div>
  );
}
