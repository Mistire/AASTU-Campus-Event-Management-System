import { CemsMetricCard } from "@/components/cems/CemsMetricCard";
import { Users, TrendingUp, UserCheck } from "lucide-react";
import { useAttendanceStats } from "../api/get-attendance";

interface AttendanceStatsProps {
  eventId: string;
}

export function AttendanceStats({ eventId }: AttendanceStatsProps) {
  const { data: stats, isLoading } = useAttendanceStats(eventId);

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[72px] rounded-2xl bg-gray-50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <CemsMetricCard
        title="Total Registrations"
        value={stats.totalRegistrations}
        icon={Users}
      />
      <CemsMetricCard
        title="Active Check-ins"
        value={stats.totalCheckins}
        icon={UserCheck}
        subValue="Live"
        trend="up"
      />
      <CemsMetricCard
        title="Attendance Rate"
        value={`${Math.round(stats.attendanceRate)}%`}
        icon={TrendingUp}
      />
    </div>
  );
}
