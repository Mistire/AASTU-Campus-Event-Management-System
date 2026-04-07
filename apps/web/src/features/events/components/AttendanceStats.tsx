import { CardController } from "@/components/shared/CardController";
import { Users, TrendingUp, UserCheck } from "lucide-react";
import { useAttendanceStats } from "../api/get-attendance";

interface AttendanceStatsProps {
  eventId: string;
}

export function AttendanceStats({ eventId }: AttendanceStatsProps) {
  const { data: stats, isLoading } = useAttendanceStats(eventId);

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-3xl bg-gray-50 animate-pulse" />
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: "Total Registrations",
      value: stats.totalRegistrations,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Check-ins",
      value: stats.totalCheckins,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Attendance Rate",
      value: `${Math.round(stats.attendanceRate)}%`,
      icon: TrendingUp,
      color: "text-brand",
      bg: "bg-brand/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statItems.map((item, index) => (
        <CardController key={index} className="p-6 rounded-[2.5rem] border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <item.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                {item.label}
              </p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">
                {item.value}
              </h4>
            </div>
          </div>
        </CardController>
      ))}
    </div>
  );
}
