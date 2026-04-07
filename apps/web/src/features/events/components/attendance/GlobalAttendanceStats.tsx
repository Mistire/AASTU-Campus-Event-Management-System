import { UserCheck, Calendar, Activity, TrendingUp } from "lucide-react";
import { GlobalAttendanceStats as StatsType } from "../../api/get-attendance";
import { CardController } from "@/components/shared/CardController";

interface GlobalAttendanceStatsProps {
  stats?: StatsType;
  isLoading: boolean;
}

export function GlobalAttendanceStats({ stats, isLoading }: GlobalAttendanceStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <CardController className="p-6 bg-white border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
          <UserCheck size={80} />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center text-brand border border-brand/10">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Check-ins Today</p>
            <h3 className="text-2xl font-black text-gray-900 leading-none mt-1">
              {isLoading ? "..." : stats?.totalCheckinsToday}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 w-fit px-2 py-0.5 rounded-full border border-emerald-100">
          <TrendingUp size={12} />
          <span className="text-[10px] font-black">{stats?.engagementTrend || "+12%"}</span>
        </div>
      </CardController>

      <CardController className="p-6 bg-white border-gray-100 shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
          <Calendar size={80} />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Events</p>
            <h3 className="text-2xl font-black text-gray-900 leading-none mt-1">
              {isLoading ? "..." : stats?.activeEvents}
            </h3>
          </div>
        </div>
        <p className="text-[10px] font-bold text-gray-400">Currently hosting check-ins</p>
      </CardController>

      <CardController className="p-6 bg-brand border-brand shadow-xl shadow-brand/20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-[0.1] text-white group-hover:scale-110 transition-transform duration-500">
          <Activity size={80} />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Campus Health</p>
            <h3 className="text-2xl font-black text-white leading-none mt-1">High</h3>
          </div>
        </div>
        <p className="text-[10px] font-bold text-white/80">Engagement is above average</p>
      </CardController>
    </div>
  );
}
