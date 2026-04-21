import { CemsMetricCard } from "@/components/cems/CemsMetricCard";
import { EventStatusName } from "../types";
import { Activity, CheckCircle, Clock, XCircle, FileEdit, Archive } from "lucide-react";

interface StatsSummaryProps {
  stats?: Record<EventStatusName, number>;
}

export const StatsSummary = ({ stats }: StatsSummaryProps) => {
  if (!stats) return null;

  const statItems = [
    { label: "Live", count: stats.LIVE, icon: Activity },
    { label: "Approved", count: stats.APPROVED, icon: CheckCircle },
    { label: "Pending", count: stats.PENDING, icon: Clock },
    { label: "Draft", count: stats.DRAFT, icon: FileEdit },
    { label: "Cancelled", count: stats.CANCELLED, icon: XCircle },
    { label: "Archived", count: stats.ARCHIVED, icon: Archive },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {statItems.map((item) => (
        <CemsMetricCard
          key={item.label}
          title={item.label}
          value={item.count}
          icon={item.icon}
        />
      ))}
    </div>
  );
};
