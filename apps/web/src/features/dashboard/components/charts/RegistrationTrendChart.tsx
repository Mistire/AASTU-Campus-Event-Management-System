"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { chartColorsFallback } from "@/components/cems/theme";
import { useAdminTrends } from "@/features/dashboard/api/getAdminTrends";
import { Skeleton } from "@/components/ui/skeleton";

export function RegistrationTrendChart() {
  const { data, isLoading } = useAdminTrends("30d");

  if (isLoading) {
    return <Skeleton className="w-full h-[220px] rounded-xl" />;
  }

  const chartData = (data || []).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    registrations: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColorsFallback[0]} stopOpacity={0.3} />
            <stop offset="100%" stopColor={chartColorsFallback[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
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
        <Area
          type="monotone"
          dataKey="registrations"
          stroke={chartColorsFallback[0]}
          strokeWidth={2}
          fill="url(#brandGradient)"
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
