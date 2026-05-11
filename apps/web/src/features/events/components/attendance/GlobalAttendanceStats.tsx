import { UserCheck, Calendar, Activity, TrendingUp } from "lucide-react";
import { GlobalAttendanceStats as StatsType } from "../../api/get-attendance";
import { CemsCard, CemsCardContent } from "@/components/cems/CemsCard";
import { CemsStatusDot } from "@/components/cems/CemsStatusDot";

interface GlobalAttendanceStatsProps {
  stats?: StatsType;
  isLoading: boolean;
}

export function GlobalAttendanceStats({ stats, isLoading }: GlobalAttendanceStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <CemsCard hoverable>
        <CemsCardContent className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
            <UserCheck size={80} />
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-11 h-11 rounded-lg bg-brand/5 flex items-center justify-center text-brand shrink-0">
              <UserCheck size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Check-ins Today</p>
              <h3 className="text-2xl font-black text-gray-900 leading-none mt-1">
                {isLoading ? "..." : stats?.totalCheckinsToday}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-50 w-fit px-2 py-0.5 rounded-lg border border-emerald-100 text-[10px] font-bold">
            <TrendingUp size={12} />
            <span>{stats?.engagementTrend || "+12%"}</span>
          </div>
        </CemsCardContent>
      </CemsCard>

      <CemsCard hoverable>
        <CemsCardContent className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
            <Calendar size={80} />
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Calendar size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Events</p>
              <h3 className="text-2xl font-black text-gray-900 leading-none mt-1">
                {isLoading ? "..." : stats?.activeEvents}
              </h3>
            </div>
          </div>
          <p className="text-[10px] font-medium text-gray-400">Currently hosting check-ins</p>
        </CemsCardContent>
      </CemsCard>

      <CemsCard className="bg-brand ring-brand shadow-lg shadow-brand/20">
        <CemsCardContent className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.1] text-white group-hover:scale-110 transition-transform duration-500">
            <Activity size={80} />
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-11 h-11 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <Activity size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Campus Health</p>
              <h3 className="text-2xl font-black text-white leading-none mt-1">High</h3>
            </div>
          </div>
          <p className="text-[10px] font-medium text-white/80">Engagement is above average</p>
        </CemsCardContent>
      </CemsCard>
    </div>
  );
}
