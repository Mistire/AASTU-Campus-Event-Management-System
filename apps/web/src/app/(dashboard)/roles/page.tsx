'use client';

import { useState, useEffect } from 'react';
import {
    Shield,
    Plus,
    Search,
    Lock,
    UserCheck,
    Edit3,
    Trash2,
    Key,
    ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';

interface Role {
    id: string;
    roleName: string;
    description: string;
    RolePermission?: {
        permission: {
            name: string;
        };
    }[];
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await api.get('/role');
            setRoles(res.data?.data || res.data || []);
        } catch (err) {
            console.error('Failed to fetch roles', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Roles & Permissions</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Define access levels and granular permissions for the entire campus.</p>
                </div>

                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 shadow-xl shadow-blue-500/10 transition-all hover:scale-105 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Create Role
                </Button>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden border border-gray-100">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-800">Access Groups</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/30">
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Role Name</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Description</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Permissions</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse h-24">
                                            <td colSpan={4} className="px-8"><div className="w-32 h-4 bg-gray-100 rounded" /></td>
                                        </tr>
                                    ))
                                ) : roles.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">No roles configured.</td>
                                    </tr>
                                ) : (
                                    roles.map((role) => (
                                        <tr key={role.id} className="hover:bg-blue-50/10 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                        <UserCheck className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-bold text-gray-900">{role.roleName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-gray-500 max-w-xs">{role.description}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-1.5 max-w-sm">
                                                    {role.RolePermission?.slice(0, 3).map((rp, i) => (
                                                        <Badge key={i} variant="outline" className="text-[10px] font-bold bg-gray-50 border-gray-200">
                                                            {rp.permission.name}
                                                        </Badge>
                                                    ))}
                                                    {(role.RolePermission?.length || 0) > 3 && (
                                                        <span className="text-[10px] font-bold text-gray-400 px-1">
                                                            +{(role.RolePermission?.length || 0) - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-blue-600 hover:text-white">
                                                        <Key className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-red-500 hover:text-white">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Define New Access Role">
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Role Identifier</label>
                        <Input placeholder="e.g. EVENT_MANAGER" className="rounded-2xl h-14" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Description</label>
                        <Input placeholder="What can users with this role do?" className="rounded-2xl h-14" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="flex-1 h-14 rounded-2xl font-bold bg-gray-50">Cancel</Button>
                        <Button className="flex-1 h-14 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20">Create Role</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
