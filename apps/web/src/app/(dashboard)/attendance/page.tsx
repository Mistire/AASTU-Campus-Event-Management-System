'use client';

import { useState, useEffect } from 'react';
import {
    ClipboardCheck,
    Search,
    User,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Filter,
    QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

interface Attendance {
    id: string;
    checkInTime: string;
    qrToken: string;
    user: { fullName: string; email: string };
    event: { title: string };
    session?: { title: string };
}

export default function AttendancePage() {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchAttendances = async () => {
        setLoading(true);
        try {
            const res = await api.get('/attendance');
            setAttendances(res.data?.data || res.data || []);
        } catch (err) {
            console.error('Failed to fetch attendance', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendances();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                            <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Live Attendance</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Track and verify student participation for all campus activities.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl border-gray-200 h-14 px-6 font-bold flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-indigo-600" />
                        Scan QR
                    </Button>
                </div>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden border border-gray-100">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-800">Check-in Logs</CardTitle>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by event or student..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-11 rounded-2xl border-gray-200 bg-white h-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/30">
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Student</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Event & Session</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Check-in Time</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse h-20">
                                            <td colSpan={4} className="px-8"><div className="w-full h-4 bg-gray-100 rounded" /></td>
                                        </tr>
                                    ))
                                ) : attendances.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">No attendance records found.</td>
                                    </tr>
                                ) : (
                                    attendances.map((att) => (
                                        <tr key={att.id} className="hover:bg-indigo-50/10 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{att.user.fullName}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">{att.user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                                        {att.event.title}
                                                    </span>
                                                    {att.session && (
                                                        <span className="text-[10px] text-gray-500 font-medium ml-5">
                                                            Session: {att.session.title}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(att.checkInTime).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg px-2 py-1 text-[10px] font-bold">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    VERIFIED
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
