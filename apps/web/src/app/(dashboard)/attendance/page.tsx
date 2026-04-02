"use client";

import { CheckCircle, Clock, User, Calendar } from 'lucide-react';
import { DataTable, ColumnTypes } from '@/components/ui/data-table/data-table';

interface AttendanceRecord {
    id: string;
    userName: string;
    eventName: string;
    checkInTime: string;
    status: 'PRESENT' | 'LATE' | 'EXCUSED';
}

const mockAttendance: AttendanceRecord[] = [
    { id: '1', userName: 'Abebe Bikila', eventName: 'Tech Expo 2026', checkInTime: '2026-03-31 09:12', status: 'PRESENT' },
    { id: '2', userName: 'Martha Tadesse', eventName: 'Tech Expo 2026', checkInTime: '2026-03-31 09:45', status: 'LATE' },
    { id: '3', userName: 'Kebede Molla', eventName: 'Career Seminar', checkInTime: '2026-03-31 14:05', status: 'PRESENT' },
    { id: '4', userName: 'Sara Lemma', eventName: 'Career Seminar', checkInTime: '2026-03-31 14:30', status: 'LATE' },
];

export default function AttendancePage() {
    const columns = [
        ColumnTypes.text<AttendanceRecord>('userName', 'User', {
            render: (val) => (
                <div className="flex items-center gap-2 font-medium">
                    <User className="w-4 h-4 text-brand" />
                    {String(val)}
                </div>
            ),
            width: '25%'
        }),
        ColumnTypes.text<AttendanceRecord>('eventName', 'Event', {
            render: (val) => (
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {String(val)}
                </div>
            ),
            width: '30%'
        }),
        ColumnTypes.text<AttendanceRecord>('checkInTime', 'Check-In', {
            render: (val) => (
                <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {String(val)}
                </div>
            ),
            width: '25%'
        }),
        ColumnTypes.badge<AttendanceRecord>('status', 'Status', {
            render: (val) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${val === 'PRESENT' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                    {String(val)}
                </span>
            ),
            width: '20%',
            align: 'right'
        }),
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-brand" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Attendance</h1>
                        <p className="text-gray-500 text-sm">Monitor event check-ins and student participation.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <DataTable
                    data={mockAttendance}
                    columns={columns}
                    pagination={{ pageSize: 10, showTotal: true }}
                    hoverable
                />
            </div>
        </div>
    );
}
