'use client';

import { useState, useEffect } from 'react';
import {
    Calendar,
    Plus,
    Search,
    MapPin,
    Clock,
    Tag,
    MoreHorizontal,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Filter,
    ArrowRight,
    Edit3,
    Trash2,
    Layers,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface Event {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    capacity: number;
    category: { name: string };
    venue: { name: string; building?: string };
    status: { statusName: string };
    createdAt: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form state for new event
    const [categories, setCategories] = useState<any[]>([]);
    const [venues, setVenues] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/events', { params: { search } });
            setEvents(res.data?.data || res.data || []);
        } catch (err) {
            console.error('Failed to fetch events', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMetadata = async () => {
        try {
            const [catRes, venueRes, statusRes] = await Promise.all([
                api.get('/categories'),
                api.get('/venues'), // Assuming this exists
                api.get('/event-status') // Assuming this exists or using a fallback
            ]);
            setCategories(catRes.data?.data || catRes.data || []);
            setVenues(venueRes.data?.data || venueRes.data || []);
            setStatuses(statusRes.data?.data || statusRes.data || []);
        } catch (err) {
            console.error('Failed to fetch metadata', err);
        }
    };

    useEffect(() => {
        fetchEvents();
        fetchMetadata();
    }, [search]);

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'ACTIVE':
            case 'CONFIRMED':
            case 'PUBLISHED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'PENDING':
            case 'DRAFT':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'CANCELLED':
                return 'bg-red-50 text-red-700 border-red-100';
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
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Event Control</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Oversee all campus activities, venues, and registrations.</p>
                </div>

                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 px-8 shadow-xl shadow-indigo-500/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Create Event
                </Button>
            </div>

            {/* Content Card */}
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden border border-gray-100">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-800">Campus Events <span className="text-gray-400 font-medium ml-2 text-sm">({events.length} Total)</span></CardTitle>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search events..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-11 rounded-2xl border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 h-10 transition-all"
                                />
                            </div>
                            <Button variant="outline" className="rounded-2xl border-gray-200 text-gray-600 h-10 px-4 hover:bg-gray-50">
                                <Filter className="w-4 h-4 mr-2" />
                                Status
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/30">
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Event Details</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Venue & Time</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Category</th>
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
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100" />
                                                    <div className="space-y-2">
                                                        <div className="w-48 h-4 bg-gray-100 rounded" />
                                                        <div className="w-32 h-3 bg-gray-50 rounded" />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : events.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium italic">
                                            No events found in the campus directory.
                                        </td>
                                    </tr>
                                ) : (
                                    events.map((event) => (
                                        <tr key={event.id} className="hover:bg-indigo-50/10 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                                                        <Layers className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 leading-none mb-1">{event.title}</p>
                                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                            <Users className="w-3 h-3" />
                                                            Cap: {event.capacity}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                                        {event.venue.name} {event.venue.building && `(${event.venue.building})`}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        {new Date(event.startTime).toLocaleDateString()} at {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 uppercase tracking-widest">
                                                    <Tag className="w-3 h-3" />
                                                    {event.category.name}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <Badge className={cn("rounded-lg px-2.5 py-1 text-[10px] font-bold border", getStatusColor(event.status.statusName))}>
                                                    {event.status.statusName}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
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

            {/* Create Event Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Campus Event"
                description="Fill in the details below to schedule a new event on campus."
            >
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Event Title</label>
                        <Input placeholder="e.g., Annual Tech Symposium 2026" className="rounded-2xl h-14 border-gray-200 bg-gray-50 focus:bg-white transition-colors" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Category</label>
                            <select className="w-full rounded-2xl h-14 border-gray-200 bg-gray-50 px-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-gray-700 appearance-none">
                                <option value="">Select category...</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Initial Status</label>
                            <select className="w-full rounded-2xl h-14 border-gray-200 bg-gray-50 px-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-gray-700 appearance-none">
                                <option value="">Select status...</option>
                                {statuses.map(s => <option key={s.id} value={s.id}>{s.statusName}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Venue</label>
                            <select className="w-full rounded-2xl h-14 border-gray-200 bg-gray-50 px-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-gray-700 appearance-none">
                                <option value="">Select venue...</option>
                                {venues.map(v => <option key={v.id} value={v.id}>{v.name} {v.building ? `(${v.building})` : ''}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Max Capacity</label>
                            <Input type="number" placeholder="500" className="rounded-2xl h-14 border-gray-200 bg-gray-50 focus:bg-white transition-colors" />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Start Date & Time</label>
                            <Input type="datetime-local" className="rounded-2xl h-14 border-gray-200 bg-gray-50 focus:bg-white transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">End Date & Time</label>
                            <Input type="datetime-local" className="rounded-2xl h-14 border-gray-200 bg-gray-50 focus:bg-white transition-colors" />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="flex-1 h-14 rounded-2xl font-bold bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all">Discard Draft</Button>
                        <Button className="flex-1 h-14 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 transition-all">Publish Event</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
