import { CardController } from "@/components/shared/CardController";
import { BadgeController } from "@/components/shared/BadgeController";
import { EventStatusName } from "../types";
import { Activity, CheckCircle, Clock, XCircle, FileEdit, Archive } from "lucide-react";

interface StatsSummaryProps {
  stats?: Record<EventStatusName, number>;
}

export const StatsSummary = ({ stats }: StatsSummaryProps) => {
  if (!stats) return null;

  const statItems = [
    { label: "Live", count: stats.LIVE, icon: <Activity className="w-4 h-4 text-green-500" /> },
    { label: "Approved", count: stats.APPROVED, icon: <CheckCircle className="w-4 h-4 text-blue-500" /> },
    { label: "Pending", count: stats.PENDING, icon: <Clock className="w-4 h-4 text-yellow-500" /> },
    { label: "Draft", count: stats.DRAFT, icon: <FileEdit className="w-4 h-4 text-gray-500" /> },
    { label: "Cancelled", count: stats.CANCELLED, icon: <XCircle className="w-4 h-4 text-red-500" /> },
    { label: "Archived", count: stats.ARCHIVED, icon: <Archive className="w-4 h-4 text-purple-500" /> },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statItems.map((item) => (
        <CardController
          key={item.label}
          className="p-4 flex flex-col items-center justify-between shadow-sm border-gray-100"
          contentClassName="p-0 text-center"
        >
          <div className="flex items-center gap-2 mb-2">
            {item.icon}
            <span className="text-xs font-medium text-gray-500">{item.label}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{item.count}</p>
        </CardController>
      ))}
    </div>
  );
};
