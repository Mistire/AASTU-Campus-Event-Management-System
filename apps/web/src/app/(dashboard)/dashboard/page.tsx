"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    Calendar,
    UserPlus,
    MapPin,
    Layers,
    Activity,
    RefreshCw
} from 'lucide-react';
import { useRecentRegistrations } from '@/features/dashboard/api/getRecentRegistrations';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const MetricCard = ({
    title,
    value,
    icon: Icon,
    subValue
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    subValue?: string
}) => (
    <Card className="rounded-xl shadow-sm border-gray-100 relative overflow-hidden">
        <CardContent className="p-4 flex flex-col items-center justify-center min-h-[110px]">
            <div className="absolute top-3 left-3 text-gray-400">
                <Icon size={14} />
            </div>
            {subValue && (
                <div className="absolute top-2 right-2 text-[9px] text-emerald-500 font-bold uppercase">
                    {subValue}
                </div>
            )}
            <div className="text-3xl font-bold text-brand mt-4">{value}</div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{title}</p>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const { profile } = useAuthStore();
    const router = useRouter();
    const { data: registrations, isLoading, isError, refetch } = useRecentRegistrations();

    useEffect(() => {
        if (profile && (profile.role === "STUDENT" || profile.roles?.includes("STUDENT"))) {
            router.replace("/discovery");
        }
    }, [profile, router]);

    return (
        <div className="space-y-4 font-sans text-brand-dark">
            {/* Top row metrics - Using Placeholders as requested */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-brand">
                <MetricCard
                    title="Users"
                    value="1,248"
                    icon={Users}
                    subValue="+12%"
                />
                <MetricCard
                    title="Events"
                    value="42"
                    icon={Calendar}
                    subValue="8 Live"
                />
                <MetricCard
                    title="Registrations"
                    value="856"
                    icon={UserPlus}
                    subValue="+24 Today"
                />
                <MetricCard
                    title="Venues"
                    value="12"
                    icon={MapPin}
                />
                <MetricCard
                    title="Categories"
                    value="15"
                    icon={Layers}
                />
            </div>

            {/* Third Row: Map and Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Map Card */}
                <Card className="rounded-xl shadow-sm border-gray-100 overflow-hidden flex flex-col h-[500px]">
                    <CardHeader className="py-3 px-4 border-b border-gray-100 flex flex-row items-center justify-between bg-white shrink-0">
                        <div className="flex items-center gap-2">
                            <MapPin className="text-brand w-4 h-4" />
                            <CardTitle className="text-sm font-bold text-gray-800">Campus Event Heatmap</CardTitle>
                        </div>
                        <div className="border border-brand text-brand px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">
                            Live
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 relative bg-slate-900 border-none">
                        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center p-4 text-center">
                            <div className="text-slate-500 text-sm">
                                Campus map integration goes here.<br />
                                Show visual density of upcoming events.
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Registrations Table - Using Real Data */}
                <Card className="rounded-xl shadow-sm border-gray-100 flex flex-col h-[500px]">
                    <CardHeader className="py-4 px-6 border-b border-gray-100 flex flex-row items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Activity className="text-brand w-5 h-5" />
                            <CardTitle className="text-base font-bold text-gray-800">Recent Registrations</CardTitle>
                        </div>
                        <button className="text-brand text-[10px] font-bold tracking-widest uppercase hover:underline">
                            View All &rarr;
                        </button>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="p-20 text-center text-gray-400 text-sm">
                                Failed to load registrations.
                            </div>
                        ) : registrations?.length === 0 ? (
                            <div className="p-20 text-center text-gray-400 text-sm italic">
                                No registrations found.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="border-b border-gray-100">
                                        <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                                        <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Event</th>
                                        <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations?.map((reg) => (
                                        <tr key={reg.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xs">
                                                        {reg.user.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800">{reg.user.fullName}</p>
                                                        <p className="text-[10px] text-gray-400">{reg.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-xs text-gray-600 font-medium">
                                                {reg.event.title}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                                                    reg.status.name === 'APPROVED' ? "bg-emerald-100 text-emerald-600" :
                                                        reg.status.name === 'PENDING' ? "bg-amber-100 text-amber-600" :
                                                            "bg-gray-100 text-gray-600"
                                                )}>
                                                    {reg.status.name}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right text-[10px] text-gray-400 font-bold">
                                                {new Date(reg.registrationDate).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                    <div className="py-3 px-6 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-medium shrink-0 bg-gray-50/50">
                        <span>Updated just now</span>
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-1 text-brand font-bold uppercase tracking-widest hover:underline"
                        >
                            <RefreshCw size={12} />
                            Refresh
                        </button>
                    </div>
                </Card>
            </div>

            <div className="text-center py-4">
                <span className="text-[10px] font-bold text-brand uppercase tracking-widest">
                    CEMS v1.0
                </span>
            </div>
        </div>
    );
}
