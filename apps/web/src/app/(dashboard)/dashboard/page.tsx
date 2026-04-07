"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    PieChart
} from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";
import { TableController } from "@/components/shared/TableController";
import { useRecentRegistrations, RecentRegistration } from '@/features/dashboard/api/getRecentRegistrations';
import { useDashboardStats } from '@/features/dashboard/api/getStats';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

const MetricCard = ({
    title,
    value,
    icon: Icon,
    subValue,
    trend
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    subValue?: string;
    trend?: 'up' | 'down' | 'neutral'
}) => (
    <Card className="rounded-3xl shadow-2xl shadow-gray-200/50 border-none relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 bg-white">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[140px]">
            <div className="absolute top-6 left-6 w-10 h-10 rounded-2xl bg-brand/5 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                <Icon size={18} />
            </div>
            
            <div className="text-4xl font-black text-gray-900 tracking-tighter mt-4">{value}</div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-3 group-hover:text-brand transition-colors">{title}</p>
            
            {subValue && (
                <div className={cn(
                    "mt-4 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1",
                    trend === 'up' ? "bg-emerald-50 text-emerald-600" : 
                    trend === 'down' ? "bg-red-50 text-red-600" : 
                    "bg-blue-50 text-blue-600"
                )}>
                    {subValue}
                </div>
            )}
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const { profile } = useAuthStore();
    const router = useRouter();
    const { data: registrations, isLoading: isRegLoading, refetch } = useRecentRegistrations();
    const { data: stats, isLoading: isStatsLoading } = useDashboardStats();

    useEffect(() => {
        if (profile && (profile.role === "STUDENT" || profile.roles?.includes("STUDENT"))) {
            router.replace("/discovery");
        }
    }, [profile, router]);

    const regStats = useMemo(() => {
        if (!registrations) return { approved: 0, pending: 0, total: 0, today: 0 };
        
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const approved = registrations.filter(r => r.status.name === 'APPROVED').length;
        const pending = registrations.filter(r => r.status.name === 'PENDING').length;
        const today = registrations.filter(r => new Date(r.registrationDate) >= startOfToday).length;
        
        return { approved, pending, total: registrations.length, today };
    }, [registrations]);

    const activityColumns: ColumnDef<RecentRegistration>[] = [
        {
            id: "index",
            header: "No.",
            cell: ({ row }) => <span className="text-gray-500 font-medium">{row.index + 1}</span>,
            size: 50,
        },
        {
            accessorKey: "user.fullName",
            header: "User Profile",
            cell: ({ row }) => {
                const user = row.original.user;
                return (
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand font-black text-xs border border-brand/10 shadow-sm transition-transform group-hover:scale-110">
                            {user.fullName.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-900 group-hover:text-brand transition-colors">{user.fullName}</p>
                            <p className="text-[10px] font-medium text-gray-400 mt-0.5">{user.email}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "event.title",
            header: "Target Event",
            cell: ({ row }) => <p className="text-xs font-bold text-gray-600 line-clamp-1">{row.original.event.title}</p>,
        },
        {
            accessorKey: "status.name",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status.name;
                return (
                    <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5",
                        status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        status === 'PENDING' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        "bg-gray-50 text-gray-500 border border-gray-100"
                    )}>
                        <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            status === 'APPROVED' ? "bg-emerald-500" :
                            status === 'PENDING' ? "bg-amber-500" : "bg-gray-400"
                        )} />
                        {status}
                    </span>
                );
            },
        },
        {
            accessorKey: "registrationDate",
            header: "Date",
            cell: ({ row }) => (
                <p className="text-[10px] font-black text-gray-400 tracking-widest text-right">
                    {new Date(row.original.registrationDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                </p>
            ),
        }
    ];

    return (
        <div className="space-y-6 font-sans text-brand-dark pb-10 animate-in fade-in duration-700">
            {/* Top row metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {isStatsLoading ? (
                    [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-[160px] rounded-3xl" />)
                ) : (
                    <>
                        <MetricCard title="Users" value={stats?.users?.toLocaleString() || "0"} icon={Users} />
                        <MetricCard title="Events" value={stats?.events || "0"} icon={Calendar} subValue={`${stats?.events || 0} Total`} trend="neutral" />
                        <MetricCard 
                            title="Total Reg" 
                            value={stats?.registrations?.toLocaleString() || "0"} 
                            icon={UserPlus} 
                            subValue={regStats.today > 0 ? `+${regStats.today} TODAY` : "NO NEW TODAY"} 
                            trend={regStats.today > 0 ? "up" : "neutral"} 
                        />
                        <MetricCard title="Venues" value={stats?.venues || "0"} icon={MapPin} />
                        <MetricCard title="Categories" value={stats?.categories || "0"} icon={Layers} />
                    </>
                )}
            </div>

            {/* Content Row: Status Overview and Recent Registrations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status Overview Card */}
                <Card className="lg:col-span-1 rounded-3xl shadow-2xl shadow-gray-200/50 border-none overflow-hidden flex flex-col bg-white">
                    <CardHeader className="py-8 px-10 flex flex-row items-center justify-between border-b border-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <PieChart size={20} />
                            </div>
                            <CardTitle className="text-xl font-black text-gray-900 tracking-tight">Status Insight</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 flex-1 flex flex-col justify-center">
                        <div className="space-y-8">
                            <div className="flex justify-between items-center p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 group hover:scale-[1.05] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Approved</p>
                                        <p className="text-2xl font-black text-gray-900">{regStats.approved}</p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black text-emerald-600 bg-emerald-100/50 px-3 py-1 rounded-full uppercase tracking-widest">
                                    {regStats.total > 0 ? Math.round((regStats.approved/regStats.total)*100) : 0}%
                                </div>
                            </div>

                             <div className="flex justify-between items-center p-6 rounded-2xl bg-amber-50/50 border border-amber-100/50 group hover:scale-[1.05] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-amber-600 uppercase tracking-widest">Pending</p>
                                        <p className="text-2xl font-black text-gray-900">{regStats.pending}</p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black text-amber-600 bg-amber-100/50 px-3 py-1 rounded-full uppercase tracking-widest">
                                    {regStats.total > 0 ? Math.round((regStats.pending/regStats.total)*100) : 0}%
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-gray-50">
                                <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    <span>Sync Status</span>
                                    <span className="text-emerald-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Live Data
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Card */}
                <Card className="lg:col-span-2 rounded-3xl shadow-2xl shadow-gray-200/50 border-none flex flex-col bg-white overflow-hidden">
                    <CardHeader className="py-8 px-10 border-b border-gray-50 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-brand/5 flex items-center justify-center text-brand">
                                <Activity size={20} />
                            </div>
                            <CardTitle className="text-xl font-black text-gray-900 tracking-tight">Recent Activity</CardTitle>
                        </div>
                        <button className="text-brand text-[10px] font-black tracking-widest uppercase hover:underline decoration-2 underline-offset-4">
                            View Archive &rarr;
                        </button>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <TableController 
                            columns={activityColumns}
                            data={registrations || []}
                            loading={isRegLoading}
                            emptyMessage="No recent registrations found."
                        />
                    </CardContent>
                    <div className="py-5 px-10 border-t border-gray-50 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500" />
                             <span>Auto-Update Active</span>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-2 text-brand hover:underline group"
                        >
                            <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-700" />
                            Refresh Dashboard
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
