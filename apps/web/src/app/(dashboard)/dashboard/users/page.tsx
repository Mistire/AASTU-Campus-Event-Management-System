"use client";

import { Users as UsersIcon, Plus } from 'lucide-react';
import { TableController } from '@/components/shared/TableController';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/features/users/testing/mock-users';
import { getUsersColumns } from '@/features/users/components/UsersTableConfig';

export default function UsersPage() {
    const columns = getUsersColumns();

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-brand/5 flex items-center justify-center text-brand border border-brand/10 shadow-sm shrink-0">
                        <UsersIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">User Management</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand" />
                            Control site access and permissions.
                        </p>
                    </div>
                </div>
                <Button className="rounded-xl bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20 h-12 px-6 font-black uppercase tracking-widest text-[11px]">
                    <Plus className="w-4 h-4 mr-2" />
                    Invite User
                </Button>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100/50">
                <div className="p-0">
                    <TableController
                        data={mockUsers}
                        columns={columns}
                        emptyMessage="No users found."
                    />
                </div>
            </div>
        </div>
    );
}
