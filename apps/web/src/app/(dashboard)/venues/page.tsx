'use client';

import { useState, useEffect } from 'react';
import {
    MapPin,
    Plus,
    Search,
    Building2,
    Users,
    Edit3,
    Trash2,
    Loader2,
    Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/axios';

interface Venue {
    id: string;
    name: string;
    building: string;
    roomNumber: string;
    capacity: number;
    description: string;
}

export default function VenuesPage() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchVenues = async () => {
        setLoading(true);
        try {
            const res = await api.get('/venues', { params: { search } });
            setVenues(res.data?.data || res.data || []);
        } catch (err) {
            console.error('Failed to fetch venues', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, [search]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Campus Venues</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Manage graduation halls, lecture rooms, and outdoor event spaces.</p>
                </div>

                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 px-8 shadow-xl shadow-indigo-500/10 transition-all hover:scale-105 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Register Venue
                </Button>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden border border-gray-100">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-800">Facilities Map</CardTitle>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by name or building..."
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
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Venue Name</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Location</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Max Capacity</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse h-20">
                                            <td colSpan={4} className="px-8"><div className="w-48 h-4 bg-gray-100 rounded" /></td>
                                        </tr>
                                    ))
                                ) : venues.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">No venues registered yet.</td>
                                    </tr>
                                ) : (
                                    venues.map((venue) => (
                                        <tr key={venue.id} className="hover:bg-indigo-50/10 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                        <Map className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-bold text-gray-900">{venue.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                                        {venue.building}
                                                    </span>
                                                    <span className="text-xs text-gray-500">Room {venue.roomNumber}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-indigo-400" />
                                                    {venue.capacity} People
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-indigo-600 hover:text-white">
                                                        <Edit3 className="w-4 h-4" />
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

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Register Campus Venue">
                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Venue Name</label>
                        <Input placeholder="e.g. Grand Graduation Hall" className="rounded-2xl h-14" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Building</label>
                            <Input placeholder="e.g. Block 45" className="rounded-2xl h-14" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Room Number</label>
                            <Input placeholder="e.g. 101" className="rounded-2xl h-14" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Capacity</label>
                        <Input type="number" placeholder="500" className="rounded-2xl h-14" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="flex-1 h-14 rounded-2xl font-bold bg-gray-50">Cancel</Button>
                        <Button className="flex-1 h-14 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20">Add Venue</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
