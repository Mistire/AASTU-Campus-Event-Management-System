"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw
} from "lucide-react";
import { CemsTable } from "@/components/cems/CemsTable";
import { useLogs } from "@/features/logs/api";
import { getLogsColumns } from "@/features/logs/components/LogsTableConfig";
import { LogPreviewPanel } from "@/features/logs/components/LogPreviewPanel";



export default function ActivityPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const {
    data: logsData,
    isLoading,
    refetch,
  } = useLogs({
    page: page + 1,
    limit: pageSize,
  });

  const logs = logsData?.data || [];
  const meta = logsData?.meta;

  const columns = getLogsColumns();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent) => setSelectedLogId(e.detail);
    window.addEventListener("view-log-detail", handler as EventListener);
    return () =>
      window.removeEventListener("view-log-detail", handler as EventListener);
  }, []);

  const totalLogs = meta?.total ?? 0;
  // Note: failures count from meta stats if available, otherwise just from current page
  const failures =
    meta?.stats?.FAILURE ??
    logs.filter((l: any) => l.outcome === "FAILURE").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
            System <span className="text-brand">Activity</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Security Audit Trail & Interaction History
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Total Events
          </p>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
            {isLoading ? "—" : totalLogs}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-rose-100 dark:border-rose-900/30 p-6 shadow-sm">
          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
            Failed Attempts
          </p>
          <p className="text-3xl font-black text-rose-600 mt-1">
            {isLoading ? "—" : failures}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-emerald-100 dark:border-emerald-900/30 p-6 shadow-sm">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
            System Health
          </p>
          <p className="text-3xl font-black text-emerald-600 mt-1">
            {isLoading || totalLogs === 0
              ? "—"
              : `${Math.round(((totalLogs - failures) / totalLogs) * 100)}%`}
          </p>
        </div>
      </div>

      {/* Table Layout */}
      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-500">
        <CemsTable
          data={logs}
          columns={columns}
          loading={isLoading}
          emptyMessage="No activity logs found."
          onRowClick={(log) => setSelectedLogId(log.id)}
          enableSorting
          enableGlobalFilter
          enableColumnVisibility
          // Server-side pagination props
          manualPagination
          pageCount={meta?.totalPages || 0}
          pageIndex={page}
          pageSize={pageSize}
          totalItems={totalLogs}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Detail Panel Overlay */}
      <LogPreviewPanel
        id={selectedLogId}
        onClose={() => setSelectedLogId(null)}
      />
    </div>
  );
}
