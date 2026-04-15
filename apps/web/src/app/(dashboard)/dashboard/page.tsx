"use client";

import { CemsMetricCard } from "@/components/cems/CemsMetricCard";
import {
  CemsCard,
  CemsCardHeader,
  CemsCardContent,
  CemsCardFooter,
} from "@/components/cems/CemsCard";
import { CemsTable } from "@/components/cems/CemsTable";
import { CemsBadge } from "@/components/cems/CemsBadge";
import {
  Users,
  Calendar,
  UserPlus,
  MapPin,
  Layers,
  Activity,
  RefreshCw,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart,
  Trophy,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  useRecentRegistrations,
  RecentRegistration,
} from "@/features/dashboard/api/getRecentRegistrations";
import { useDashboardStats } from "@/features/dashboard/api/getStats";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

/* ── Chart lazy-imports (only for dashboard) ───────────────────── */
import { RegistrationTrendChart } from "@/features/dashboard/components/charts/RegistrationTrendChart";
import { CategoryDistributionChart } from "@/features/dashboard/components/charts/CategoryDistributionChart";
import { DepartmentActivityChart } from "@/features/dashboard/components/charts/DepartmentActivityChart";
import { TopEventsChart } from "@/features/dashboard/components/charts/TopEventsChart";

/* ================================================================
 *  DASHBOARD PAGE — Compact, space-efficient, chart-rich
 * ================================================================ */

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const {
    data: registrations,
    isLoading: isRegLoading,
    refetch,
  } = useRecentRegistrations();
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();

  useEffect(() => {
    if (
      profile &&
      (profile.role === "STUDENT" || profile.roles?.includes("STUDENT"))
    ) {
      router.replace("/discovery");
    }
  }, [profile, router]);

  const regStats = useMemo(() => {
    if (!registrations)
      return { approved: 0, pending: 0, total: 0, today: 0 };

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const approved = registrations.filter(
      (r) => r.status.name === "APPROVED",
    ).length;
    const pending = registrations.filter(
      (r) => r.status.name === "PENDING",
    ).length;
    const today = registrations.filter(
      (r) => new Date(r.registrationDate) >= startOfToday,
    ).length;

    return { approved, pending, total: registrations.length, today };
  }, [registrations]);

  const isAdmin = profile?.role === "ADMIN";

  /* ── Table Columns ───────────────────────────────────────────── */
  const activityColumns: ColumnDef<RecentRegistration>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-gray-400 font-medium text-xs">
          {row.index + 1}
        </span>
      ),
      size: 40,
      enableSorting: false,
    },
    {
      accessorKey: "user.fullName",
      header: "User",
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand font-bold text-xs shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {user.fullName}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "event.title",
      header: "Event",
      cell: ({ row }) => (
        <p className="text-xs font-medium text-gray-600 line-clamp-1 max-w-[180px]">
          {row.original.event.title}
        </p>
      ),
    },
    {
      accessorKey: "status.name",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status.name;
        const variant =
          status === "APPROVED"
            ? "success"
            : status === "PENDING"
              ? "warning"
              : ("neutral" as const);
        return (
          <CemsBadge status={variant} dot>
            {status}
          </CemsBadge>
        );
      },
    },
    {
      accessorKey: "registrationDate",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-[10px] font-semibold text-gray-400">
          {new Date(row.original.registrationDate).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-700">
      {/* ═══════════════════════════════════════════════════════════
       *  METRIC CARDS — Compact horizontal row
       * ═══════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          "grid grid-cols-2 gap-3",
          isAdmin ? "sm:grid-cols-3 lg:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {isStatsLoading ? (
          Array.from({ length: isAdmin ? 5 : 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-2xl" />
          ))
        ) : isAdmin ? (
          <>
            <CemsMetricCard
              title="Users"
              value={stats?.users?.toLocaleString() || "0"}
              icon={Users}
            />
            <CemsMetricCard
              title="Events"
              value={stats?.events || "0"}
              icon={Calendar}
            />
            <CemsMetricCard
              title="Registrations"
              value={stats?.registrations?.toLocaleString() || "0"}
              icon={UserPlus}
              subValue={
                regStats.today > 0 ? `+${regStats.today} today` : "—"
              }
              trend={regStats.today > 0 ? "up" : "neutral"}
            />
            <CemsMetricCard
              title="Venues"
              value={stats?.venues || "0"}
              icon={MapPin}
            />
            <CemsMetricCard
              title="Categories"
              value={stats?.categories || "0"}
              icon={Layers}
            />
          </>
        ) : (
          <>
            <CemsMetricCard
              title="My Events"
              value={stats?.totalEvents || "0"}
              icon={Calendar}
            />
            <CemsMetricCard
              title="Registrations"
              value={stats?.totalRegistrations?.toLocaleString() || "0"}
              icon={UserPlus}
            />
            <CemsMetricCard
              title="Pending"
              value={stats?.pendingApprovals || "0"}
              icon={Clock}
              subValue={
                Number(stats?.pendingApprovals) > 0 ? "Action needed" : "—"
              }
              trend={Number(stats?.pendingApprovals) > 0 ? "down" : "neutral"}
            />
            <CemsMetricCard
              title="Check-ins"
              value={stats?.totalAttendance?.toLocaleString() || "0"}
              icon={CheckCircle2}
            />
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
       *  CHARTS — 2×2 grid
       * ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Registration Trends */}
        <CemsCard>
          <CemsCardHeader
            icon={<TrendingUp />}
            title="Registration Trends"
            description="Last 30 days"
            bordered
          />
          <CemsCardContent className="pt-2">
            <RegistrationTrendChart />
          </CemsCardContent>
        </CemsCard>

        {/* Category Distribution */}
        <CemsCard>
          <CemsCardHeader
            icon={<PieChart />}
            title="Events by Category"
            description="Distribution by registrations"
            bordered
          />
          <CemsCardContent className="pt-2">
            <CategoryDistributionChart />
          </CemsCardContent>
        </CemsCard>

        {/* Department Activity */}
        <CemsCard>
          <CemsCardHeader
            icon={<BarChart3 />}
            title="Department Activity"
            description="Registrations by department"
            bordered
          />
          <CemsCardContent className="pt-2">
            <DepartmentActivityChart />
          </CemsCardContent>
        </CemsCard>

        {/* Top Events */}
        <CemsCard>
          <CemsCardHeader
            icon={<Trophy />}
            title="Top Events"
            description="Most popular by registrations"
            bordered
          />
          <CemsCardContent className="pt-2">
            <TopEventsChart />
          </CemsCardContent>
        </CemsCard>
      </div>

      {/* ═══════════════════════════════════════════════════════════
       *  RECENT REGISTRATIONS — Full-width table
       * ═══════════════════════════════════════════════════════════ */}
      <CemsCard>
        <CemsCardHeader
          icon={<Activity />}
          title={isAdmin ? "Recent Activity" : "My Event Activity"}
          bordered
          action={
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand hover:underline decoration-2 underline-offset-4 group"
            >
              <RefreshCw
                size={12}
                className="group-hover:rotate-180 transition-transform duration-700"
              />
              Refresh
            </button>
          }
        />
        <CemsTable
          columns={activityColumns}
          data={registrations || []}
          loading={isRegLoading}
          emptyMessage="No recent registrations found."
          enableSorting
          enableGlobalFilter
          enableColumnVisibility
          pageSize={10}
        />
      </CemsCard>
    </div>
  );
}
