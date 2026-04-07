import { Building2, Hash, MapPin, CheckCircle2 } from "lucide-react";
import { TabsController } from "@/components/shared/TabsController";
import { AttendanceHub } from "../attendance/AttendanceHub";

interface EventDetailTabsProps {
  eventId: string;
  event: any; // We'll improve this with a proper Event type later
  canManage: boolean;
}

export function EventDetailTabs({ eventId, event, canManage }: EventDetailTabsProps) {
  const allTabs = [
    {
      value: "attendance",
      label: "ATTENDANCE HUB",
      hidden: !canManage,
      content: <AttendanceHub eventId={eventId} />,
    },
    {
      value: "venue",
      label: "VENUE DETAILS",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      label: "SESSIONS",
      content: (
        <div className="p-8 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400">
          <CheckCircle2 className="h-10 w-10 mb-3 opacity-20" />
          <p className="font-medium">
            No special sessions defined for this event.
          </p>
        </div>
      ),
    },
  ];

  const tabItems = allTabs.filter(tab => !tab.hidden);

  return (
    <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
      <TabsController
        tabs={tabItems}
        defaultValue="attendance"
        listClassName="bg-gray-50/50 border-b border-gray-100 space-x-12 h-auto px-10 pt-6 rounded-none w-full"
        triggerClassName="data-[state=active]:text-brand data-[state=active]:border-brand border-b-4 border-transparent rounded-none h-14 px-0 font-black text-xs tracking-widest uppercase text-gray-400 pb-4"
        contentClassName="mt-0 p-10 min-h-[400px]"
        className="w-full"
      />
    </div>
  );
}
