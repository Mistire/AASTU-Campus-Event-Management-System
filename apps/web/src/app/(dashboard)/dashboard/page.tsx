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
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Table as TableIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportAnalytics } from "@/features/dashboard/api/exportAnalytics";

/* ── Chart lazy-imports (only for dashboard) ───────────────────── */
import { RegistrationTrendChart } from "@/features/dashboard/components/charts/RegistrationTrendChart";
import { CategoryDistributionChart } from "@/features/dashboard/components/charts/CategoryDistributionChart";
import { DepartmentActivityChart } from "@/features/dashboard/components/charts/DepartmentActivityChart";
import { TopEventsChart } from "@/features/dashboard/components/charts/TopEventsChart";
import { RecommendationStatusCard } from "@/features/recommendations/components/RecommendationStatusCard";
import { RecentActivityFeed } from "@/features/dashboard/components/RecentActivityFeed";
import { DashboardShortcuts } from "@/features/dashboard/components/DashboardShortcuts";

/* ================================================================
 *  DASHBOARD PAGE — Compact, space-efficient, chart-rich
 * ================================================================ */

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const {
    data: registrations,
    isLoading: isRegLoading,
  } = useRecentRegistrations();
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();
  const queryClient = useQueryClient();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate all dashboard-related queries to trigger a global refresh
      await queryClient.invalidateQueries({
        predicate: (query) => 
          ['recent-registrations', 'dashboard-stats', 'top-organizer', 'registration-trends', 'category-distribution', 'department-activity', 'top-events']
          .includes(query.queryKey[0] as string)
      });
    } finally {
      // Small delay to ensure the user sees the 'Updating' state
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

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
      size: 32,
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
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
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
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 line-clamp-1 max-w-[180px]">
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
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight tracking-tighter uppercase">
            System <span className="text-brand">Overview</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Real-time monitoring and analytics for AASTU Campus
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mr-2">Export Data</span>
            <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-1 shadow-sm">
                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => exportAnalytics({ type: "admin", format: "csv" })}
                   className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest gap-2 text-gray-500 dark:text-gray-400 hover:text-brand transition-colors"
                >
                  <TableIcon size={12} /> CSV
                </Button>
                <div className="w-px h-4 bg-gray-100 dark:bg-gray-700 my-auto" />
                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => exportAnalytics({ type: "admin", format: "pdf" })}
                   className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest gap-2 text-gray-500 dark:text-gray-400 hover:text-brand transition-colors"
                >
                  <FileText size={12} /> PDF
                </Button>
            </div>
          </div>
        )}
      </div>

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
            <Skeleton key={i} className="h-[72px] rounded-lg" />
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
       *  AI & SYSTEM PERFORMANCE (Admin Only)
       * ═══════════════════════════════════════════════════════════ */}
      {isAdmin && <RecommendationStatusCard />}

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
       *  ACTIVITY & QUICK ACTIONS — Split Layout
       * ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Recent Activity Feed (Takes up 2/3) */}
        <div className="lg:col-span-2">
          <CemsCard className="overflow-hidden h-full">
            <CemsCardHeader
              icon={<Activity />}
              title={isAdmin ? "Recent Activity" : "My Event Activity"}
              bordered
              action={
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={cn(
                    "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand hover:underline decoration-2 underline-offset-4 group transition-opacity",
                    isRefreshing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <RefreshCw
                    size={12}
                    className={cn(
                      "transition-transform duration-700",
                      isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                    )}
                  />
                  {isRefreshing ? "Updating..." : "Refresh"}
                </button>
              }
            />
            <CemsCardContent className="p-0">
              <RecentActivityFeed 
                activities={registrations?.slice(0, 7) || []} 
                loading={isRegLoading} 
              />
            </CemsCardContent>
          </CemsCard>
        </div>

        {/* Shortcuts & Pulse (Takes up 1/3) */}
        <div className="lg:col-span-1">
          <DashboardShortcuts isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}
