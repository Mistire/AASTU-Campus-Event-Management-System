import { Clock } from "lucide-react";
import { AttendanceRecord } from "../../api/get-attendance";
import { format } from "date-fns";
import Link from "next/link";

interface GlobalActivityFeedProps {
  recent?: AttendanceRecord[];
  isLoading: boolean;
}

export function GlobalActivityFeed({ recent, isLoading }: GlobalActivityFeedProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-fit">
      <div className="p-8 border-b border-gray-50 dark:border-gray-800">
        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Live Activity</h2>
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Latest check-ins</p>
      </div>
      <div className="p-6 space-y-6">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-gray-50 dark:bg-gray-800 animate-pulse" />)
        ) : (
          recent?.map((item: AttendanceRecord) => (
            <div key={item.id} className="flex gap-4 group cursor-default">
              <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-brand font-black text-xs shrink-0 group-hover:bg-brand/5 dark:group-hover:bg-brand/10 group-hover:border-brand/20 transition-all">
                {item.user.fullName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight">{item.user.fullName}</p>
                <p className="text-[10px] font-bold text-brand uppercase tracking-tighter truncate">
                  in {item.event.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                  <Clock size={10} />
                  <span className="text-[9px] font-bold tracking-widest uppercase">
                    {format(new Date(item.checkInTime), "p")}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        {(!recent || recent.length === 0) && !isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-300 font-bold text-sm">No activity recorded</p>
          </div>
        )}
      </div>
      <Link 
        href="/dashboard/events" 
        className="m-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-center text-xs font-black text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
      >
        Manage All Events
      </Link>
    </div>
  );
}
