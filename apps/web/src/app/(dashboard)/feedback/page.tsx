'use client';

import { useState, useEffect } from 'react';
import {
    MessageSquare,
    Search,
    Star,
    User,
    Calendar,
    Trash2,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import api from '@/lib/axios';

interface Feedback {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: { fullName: string; email: string };
    event: { title: string };
}

export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/feedback');
            setFeedbacks(res.data?.data || res.data || []);
        } catch (err) {
            console.error('Failed to fetch feedback', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const renderStars = (rating: number) => {
        return Array(5).fill(0).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
        ));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">User Feedbacks</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Monitor sentiment and quality reports from campus event attendees.</p>
                </div>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden border border-gray-100">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-800">Experience Reports</CardTitle>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by event or user..."
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
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">User</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Event</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Rating</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Comment</th>
                                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse h-20">
                                            <td colSpan={5} className="px-8"><div className="w-full h-4 bg-gray-100 rounded" /></td>
                                        </tr>
                                    ))
                                ) : feedbacks.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic">No feedback submitted yet.</td>
                                    </tr>
                                ) : (
                                    feedbacks.map((fb) => (
                                        <tr key={fb.id} className="hover:bg-amber-50/10 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900 leading-tight">{fb.user.fullName}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">{fb.user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                                    {fb.event.title}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex gap-0.5">{renderStars(fb.rating)}</div>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-600 italic">"{fb.comment}"</td>
                                            <td className="px-8 py-5 text-right">
                                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
