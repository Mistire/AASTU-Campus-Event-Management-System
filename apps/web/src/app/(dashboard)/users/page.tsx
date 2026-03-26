'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Search,
    MoreHorizontal,
    Shield,
    Mail,
    Phone,
    CheckCircle2,
    XCircle,
    Loader2,
    Filter,
    ArrowRight,
    Edit3,
    Trash2,
    ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface User {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: {
        roleName: string;
    };
    department?: {
        name: string;
    };
    isEmailVerified: boolean;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { profile } = useAuthStore();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users', { params: { search } });
            setUsers(res.data?.data || res.data || []);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search]);

    const getRoleBadgeColor = (role: string) => {
        switch (role.toUpperCase()) {
            case 'ADMIN':
            case 'SUPER_ADMIN':
                return 'bg-red-50 text-red-700 border-red-100';
            case 'ORGANIZER':
                return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'STAFF':
                return 'bg-purple-50 text-purple-700 border-purple-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                            <Users className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">User Management</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Manage and monitor all platform accounts and roles.</p>
                </div>

                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 shadow-xl shadow-blue-500/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                    <UserPlus className="w-5 h-5" />
                    Invite Member
                </Button>
            </div>

            {/* Table Card */}
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden border border-gray-100">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-800">Directory <span className="text-gray-400 font-medium ml-2 text-sm">({users.length} Users)</span></CardTitle>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-11 rounded-2xl border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-10 transition-all"
                                />
                            </div>
                            <Button variant="outline" className="rounded-2xl border-gray-200 text-gray-600 h-10 px-4 hover:bg-gray-50">
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/30">
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Member</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Credentials</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Designation</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-6 h-20">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100" />
                                                    <div className="space-y-2">
                                                        <div className="w-32 h-4 bg-gray-100 rounded" />
                                                        <div className="w-24 h-3 bg-gray-50 rounded" />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium italic">
                                            No members found matching your search criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-blue-50/10 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                                                        {user.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 leading-none mb-1">{user.fullName}</p>
                                                        <p className="text-xs text-gray-500">{user.department?.name || 'No Department'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        {user.email}
                                                    </div>
                                                    {user.phone && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                            {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <Badge className={cn("rounded-lg px-2.5 py-1 text-[10px] font-bold border", getRoleBadgeColor(user.role.roleName))}>
                                                    {user.role.roleName}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    {user.isEmailVerified ? (
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 uppercase tracking-tighter">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Verified
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold border border-orange-100 uppercase tracking-tighter">
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                            Pending
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm">
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

            {/* Modals */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Invite New Member"
                description="The member will receive an invitation email to set up their password."
            >
                <div className="space-y-6 pt-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Full Name</label>
                            <Input placeholder="Enter user's full name" className="rounded-2xl h-14 border-gray-200 bg-gray-50 focus:bg-white transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Email Address</label>
                            <Input placeholder="name@aastu.edu.et" className="rounded-2xl h-14 border-gray-200 bg-gray-50 focus:bg-white transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Assign Role</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['STUDENT', 'ORGANIZER', 'STAFF'].map((role) => (
                                <div
                                    key={role}
                                    className="p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 cursor-pointer text-center group transition-all"
                                >
                                    <Shield className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    <p className="text-xs font-bold text-gray-700">{role}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-14 rounded-2xl font-bold bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all">Cancel</Button>
                        <Button className="flex-1 h-14 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 transition-all">Send Invitation</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
