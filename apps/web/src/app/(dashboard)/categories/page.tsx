'use client';

import { useState, useEffect } from 'react';
import {
    Layers,
    Plus,
    Search,
    MoreHorizontal,
    Edit3,
    Trash2,
    Loader2,
    Filter,
    Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/axios';

interface Category {
    id: string;
    name: string;
    description: string;
    _count?: {
        events: number;
    };
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/categories', { params: { search } });
            setCategories(res.data?.data || res.data || []);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [search]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                            <Layers className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Categories</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Organize campus events into searchable interest groups.</p>
                </div>

                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 px-8 shadow-xl shadow-emerald-500/10 transition-all hover:scale-105 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New Category
                </Button>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden border border-gray-100">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-800">Event Classifications</CardTitle>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search categories..."
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
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Category Name</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Description</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Linked Events</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse h-20">
                                            <td colSpan={4} className="px-8">
                                                <div className="w-48 h-4 bg-gray-100 rounded" />
                                            </td>
                                        </tr>
                                    ))
                                ) : categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">No categories found.</td>
                                    </tr>
                                ) : (
                                    categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-emerald-50/10 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                        <Tag className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-bold text-gray-900">{cat.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-500 line-clamp-1 max-w-xs">{cat.description}</td>
                                            <td className="px-8 py-5">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {cat._count?.events || 0} Events
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-emerald-600 hover:text-white">
                                                        <Edit3 className="w-4 h-4" />
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

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Category">
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Category Name</label>
                        <Input placeholder="e.g. Technology, Careers, Culture" className="rounded-2xl h-14" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Description</label>
                        <textarea className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 min-h-[100px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" placeholder="What kind of events fall under this category?" />
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="flex-1 h-14 rounded-2xl font-bold bg-gray-50">Cancel</Button>
                        <Button className="flex-1 h-14 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20">Save Category</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
