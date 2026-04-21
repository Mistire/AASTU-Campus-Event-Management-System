"use client";

import { useState } from "react";
import { Users as UsersIcon, Plus } from 'lucide-react';
import { CemsTable } from '@/components/cems/CemsTable';
import { CemsButton } from '@/components/cems/CemsButton';
import { useUsers } from '@/features/users/api/getUsers';
import { getUsersColumns } from '@/features/users/components/UsersTableConfig';
import { UserRecord } from '@/features/users/types';
import { UserPreviewPanel } from '@/features/users/components/UserPreviewPanel';

export default function UsersPage() {
    const { data: users, isLoading, error } = useUsers();
    const columns = getUsersColumns();
    const [previewUser, setPreviewUser] = useState<UserRecord | null>(null);

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100 font-black uppercase tracking-widest text-xs animate-in slide-in-from-top-4 duration-500">
                Error Loading Users: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-xl bg-brand/5 flex items-center justify-center text-brand border border-brand/10 shadow-sm shrink-0">
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
                <CemsButton cemsVariant="brand" className="rounded-xl shadow-lg shadow-brand/20 h-12 px-6 font-black uppercase tracking-widest text-[11px]">
                    <Plus className="w-4 h-4 mr-2" />
                    Invite User
                </CemsButton>
            </div>

            {/* Master-Detail Layout */}
            <div className="flex gap-6">
                {/* Table */}
                <div className="bg-white rounded-xl overflow-hidden transition-all duration-300 shadow-sm border border-gray-200 flex-1 min-w-0">
                    <CemsTable
                        data={users || []}
                        columns={columns}
                        loading={isLoading}
                        emptyMessage="No users found."
                        enableSorting
                        enableGlobalFilter
                        enableColumnVisibility
                        enableRowSelection
                        onRowClick={(user) => setPreviewUser(user)}
                    />
                </div>

                {/* Detail Panel */}
                {previewUser && (
                    <UserPreviewPanel 
                        user={previewUser} 
                        onClose={() => setPreviewUser(null)} 
                    />
                )}
            </div>
        </div>
    );
}
