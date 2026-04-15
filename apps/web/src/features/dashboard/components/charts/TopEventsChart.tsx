"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { chartColorsFallback } from "@/components/cems/theme";
import { useTopEvents } from "@/features/dashboard/api/getTopEvents";
import { Skeleton } from "@/components/ui/skeleton";

export function TopEventsChart() {
  const { data, isLoading } = useTopEvents("30d");

  if (isLoading) {
    return <Skeleton className="w-full h-[220px] rounded-xl" />;
  }

  const chartData = (data || [])
    .sort((a, b) => b.registrations - a.registrations)
    .slice(0, 5)
    .map((d) => ({
      name: d.title.length > 18 ? d.title.slice(0, 18) + "…" : d.title,
      registrations: d.registrations,
      attendance: d.attendance,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        No event data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            fontSize: 12,
            fontWeight: 600,
          }}
        />
        <Bar
          dataKey="registrations"
          name="Registrations"
          radius={[0, 6, 6, 0]}
          animationDuration={1200}
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={chartColorsFallback[index % chartColorsFallback.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
