import { Building2, Hash, MapPin, CheckCircle2, Users, Layers } from "lucide-react";
import { CemsTab } from "@/components/cems/CemsTab";
import { AttendanceHub } from "../attendance/AttendanceHub";

interface EventDetailTabsProps {
  eventId: string;
  event: any;
  canManage: boolean;
  canEdit: boolean;
}

export function EventDetailTabs({ eventId, event, canManage, canEdit }: EventDetailTabsProps) {
  const allTabs = [
    {
      value: "attendance",
      label: "Attendance Hub",
      icon: <Users className="w-full h-full" />,
      hidden: !canManage,
      content: <AttendanceHub eventId={eventId} canEdit={canEdit} />,
    },
    {
      value: "venue",
      label: "Venue Details",
      icon: <MapPin className="w-full h-full" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-orange-500" />
              <h4 className="text-xs font-bold text-gray-400 uppercase">
                Building
              </h4>
            </div>
            <p className="font-semibold text-gray-800">
              {event.venue.building || "Main Campus"}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4 text-blue-500" />
              <h4 className="text-xs font-bold text-gray-400 uppercase">
                Room
              </h4>
            </div>
            <p className="font-semibold text-gray-800">
              {event.venue.roomNumber || "TBD"}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <h4 className="text-xs font-bold text-gray-400 uppercase">
                Full Address
              </h4>
            </div>
            <p className="font-semibold text-gray-800">
              {event.venue.location}
            </p>
          </div>
        </div>
      ),
    },
    {
      value: "sessions",
      label: "Sessions",
      icon: <Layers className="w-full h-full" />,
      content: (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {event.sessions && event.sessions.length > 0 ? (
            <div className="relative border-l-2 border-gray-100 ml-4 pl-8 space-y-10 py-2">
              {event.sessions.map((session: any, idx: number) => (
                <div key={session.id || idx} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full border-2 border-brand bg-white group-hover:scale-125 transition-transform duration-300" />
                  
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Time & Type */}
                    <div className="md:w-32 shrink-0">
                      <div className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">
                        {session.sessionType || "General"}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400">
                        {Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)} MIN
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-50/50 rounded-2xl p-6 border border-gray-100 group-hover:border-brand/20 group-hover:bg-white transition-all duration-300">
                      <h4 className="text-lg font-black text-gray-900 mb-2 tracking-tight leading-none uppercase">
                        {session.title}
                      </h4>
                      <p className="text-sm text-gray-500 mb-4 font-medium leading-relaxed">
                        {session.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100/50">
                        {session.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{session.location}</span>
                          </div>
                        )}
                        
                        {session.speakers && session.speakers.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            <div className="flex -space-x-2">
                              {session.speakers.map((s: any, sIdx: number) => (
                                <span key={sIdx} className="text-xs font-bold text-gray-500 bg-white border border-gray-100 px-2 py-0.5 rounded-lg">
                                  {s.speaker?.fullName || "Speaker"}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 border border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400">
              <CheckCircle2 className="h-10 w-10 mb-3 opacity-20" />
              <p className="font-bold tracking-tight uppercase text-xs">
                No special sessions defined for this event.
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  const tabItems = allTabs.filter(tab => !tab.hidden);

  return (
    <div className="bg-white rounded-xl shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
      <CemsTab
        tabs={tabItems}
        defaultValue="attendance"
      />
    </div>
  );
}
