"use client";

import { Users as UsersIcon, Plus, Shield } from 'lucide-react';
import { DataTable, ColumnTypes, BadgeConfigs } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';

interface UserRecord {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive' | 'pending';
    joined: string;
}

const mockUsers: UserRecord[] = [
    { id: '1', name: 'Abebe Bikila', email: 'abebe.b@aastu.edu.et', role: 'ADMIN', status: 'active', joined: '2025-09-01' },
    { id: '2', name: 'Martha Tadesse', email: 'martha.t@aastu.edu.et', role: 'ORGANIZER', status: 'active', joined: '2025-09-15' },
    { id: '3', name: 'Kebede Molla', email: 'kebede.m@aastu.edu.et', role: 'STUDENT', status: 'pending', joined: '2026-01-10' },
    { id: '4', name: 'Sara Lemma', email: 'sara.l@aastu.edu.et', role: 'STAFF', status: 'inactive', joined: '2025-10-20' },
    { id: '5', name: 'Yonas Berhane', email: 'yonas.b@aastu.edu.et', role: 'ORGANIZER', status: 'active', joined: '2025-11-05' },
];

export default function UsersPage() {
    const columns = [
        ColumnTypes.text<UserRecord>('name', 'User', {
            render: (_val: unknown, record: UserRecord) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-subtle flex items-center justify-center text-brand text-xs font-bold ring-1 ring-brand/20">
                        {record.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{record.name}</span>
                        <span className="text-xs text-gray-500">{record.email}</span>
                    </div>
                </div>
            )
        }),
        ColumnTypes.text('role', 'Role', {
            render: (val: unknown) => (
                <div className="flex items-center gap-1.5 font-medium text-gray-700">
                    <Shield className="w-3.5 h-3.5 text-brand" />
                    <span className="text-xs uppercase tracking-wider">{String(val)}</span>
                </div>
            )
        }),
        ColumnTypes.badge('status', 'Status', {
            render: (val: unknown) => {
                const statusKey = String(val) as keyof typeof BadgeConfigs.status;
                const config = BadgeConfigs.status[statusKey] || BadgeConfigs.status.pending;
                return (
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
                        {config.label}
                    </div>
                );
            }
        }),
        ColumnTypes.text('joined', 'Joined Date'),
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <UsersIcon className="w-8 h-8 text-brand" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h1>
                        <p className="text-gray-500 text-sm">Control site access and permissions.</p>
                    </div>
                </div>
                <Button className="rounded-xl bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Invite User
                </Button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <DataTable
                    data={mockUsers}
                    columns={columns}
                    pagination={{ pageSize: 10, showTotal: true }}
                    hoverable
                />
            </div>
        </div>
    );
}
