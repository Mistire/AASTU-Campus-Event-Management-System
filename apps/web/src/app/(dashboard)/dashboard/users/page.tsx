"use client";

import { useState } from "react";
import { Users as UsersIcon, Plus } from 'lucide-react';
import { CemsTable } from '@/components/cems/CemsTable';
import { CemsButton } from '@/components/cems/CemsButton';
import { useUsers } from '@/features/users/api/getUsers';
import { getUsersColumns } from '@/features/users/components/UsersTableConfig';
import { UserRecord } from '@/features/users/types';
import { UserPreviewPanel } from '@/features/users/components/UserPreviewPanel';
import { useRoles } from '@/features/permissions/api/getRoles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UsersPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [roleId, setRoleId] = useState<string>("");

    const { data: roles } = useRoles();

    const { data: usersData, isLoading, error } = useUsers({
        page,
        limit,
        search,
        roleId: roleId || undefined
    });

    const columns = getUsersColumns();
    const [previewUser, setPreviewUser] = useState<UserRecord | null>(null);

    const totalPages = usersData?.meta?.totalPages || 1;
    const totalItems = usersData?.meta?.total || 0;

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-100 font-black uppercase tracking-widest text-xs animate-in slide-in-from-top-4 duration-500">
                Error Loading Users: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-lg bg-brand/5 flex items-center justify-center text-brand border border-brand/10 shadow-sm shrink-0">
                        <UsersIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">User Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand" />
                            Control site access and permissions.
                        </p>
                    </div>
                </div>
                <CemsButton cemsVariant="brand" className="rounded-lg shadow-lg shadow-brand/20 h-12 px-6 font-black uppercase tracking-widest text-[11px]">
                    <Plus className="w-4 h-4 mr-2" />
                    Invite User
                </CemsButton>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                <CemsTable
                    data={usersData?.data || []}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="No users found."
                    enableSorting
                    enableGlobalFilter
                    enableColumnVisibility
                    onRowClick={(user) => setPreviewUser(user)}
                    
                    // Server-side pagination props
                    manualPagination
                    pageCount={totalPages}
                    pageIndex={page - 1}
                    pageSize={limit}
                    totalItems={totalItems}
                    onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
                    onPageSizeChange={(newSize) => {
                        setLimit(newSize);
                        setPage(1);
                    }}
                    renderToolbarActions={() => (
                        <div className="flex items-center gap-2">
                            <Select value={roleId} onValueChange={(val) => { setRoleId(val ?? ""); setPage(1); }}>
                                <SelectTrigger className="h-8 min-w-[120px] bg-gray-50/50 border-gray-100 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-white transition-all">
                                    <SelectValue placeholder="Filter by Role" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border-gray-100 shadow-2xl">
                                    <SelectItem value="">All Roles</SelectItem>
                                    {roles?.map((r: any) => (
                                        <SelectItem key={r.id} value={r.id}>{r.roleName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                />
            </div>

            {/* Detail Panel Overlay */}
            {previewUser && (
                <UserPreviewPanel 
                    user={previewUser} 
                    onClose={() => setPreviewUser(null)} 
                />
            )}
        </div>
    );
}
