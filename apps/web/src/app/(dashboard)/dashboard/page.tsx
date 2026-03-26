'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RolesList } from '@/features/dashboard/components/RolesList';
import api from '@/lib/axios';
import { CheckCircle2, Circle, Sparkles, Calendar, Users, Activity, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const { profile } = useAuthStore();
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasPreferences, setHasPreferences] = useState(false);
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!profile) return;
            try {
                // Fetch all categories - public endpoint
                const catRes = await api.get('/categories');
                const cats = catRes.data?.data || catRes.data || [];
                setCategories(Array.isArray(cats) ? cats : []);
            } catch (err) {
                console.error('Failed to fetch categories', err);
            }

            if (profile.role === 'STUDENT') {
                try {
                    const prefRes = await api.get('/users/categories/preferences');
                    const prefs = prefRes.data?.data || prefRes.data || [];
                    if (Array.isArray(prefs) && prefs.length > 0) {
                        setSelectedCategories(prefs.map((p: any) => p.categoryId || p.id));
                        setHasPreferences(true);
                    }
                } catch (err) {
                    console.error('Failed to fetch preferences', err);
                }

                try {
                    // Fetch upcoming events - public endpoint
                    const eventsRes = await api.get('/events/upcoming');
                    const evts = eventsRes.data?.data || eventsRes.data || [];
                    setEvents(Array.isArray(evts) ? evts : []);
                } catch (err) {
                    console.error('Failed to fetch events', err);
                }
            }

            setIsLoading(false);
        };

        fetchData();
    }, [profile]);

    const handleToggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleSavePreferences = async () => {
        setIsSaving(true);
        try {
            await api.post('/users/categories/preferences', { categoryIds: selectedCategories });
            setHasPreferences(true);
        } catch (err) {
            console.error('Failed to save preferences', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (profile?.role === 'STUDENT') {
        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                        Welcome back, <span className="text-blue-600">{profile.fullName.split(' ')[0]}</span>!
                    </h1>
                    <p className="text-gray-500 text-lg">Discover events tailored to your interests.</p>
                </div>

                {!hasPreferences && (
                    <Card className="rounded-3xl border-2 border-blue-100 bg-blue-50/30 overflow-hidden shadow-sm">
                        <CardHeader className="bg-white border-b border-blue-50">
                            <CardTitle className="flex items-center gap-2 text-blue-900">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                                Personalize Your Experience
                            </CardTitle>
                            <p className="text-sm text-blue-700/70 mt-1">Select at least 3 categories you're interested in.</p>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {categories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        onClick={() => handleToggleCategory(cat.id)}
                                        className={cn(
                                            "group cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3",
                                            selectedCategories.includes(cat.id)
                                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105"
                                                : "bg-white border-gray-100 hover:border-blue-200 text-gray-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                            selectedCategories.includes(cat.id) ? "bg-white/20" : "bg-gray-50 group-hover:bg-blue-50"
                                        )}>
                                            {selectedCategories.includes(cat.id) ? (
                                                <CheckCircle2 className="w-6 h-6" />
                                            ) : (
                                                <Circle className="w-6 h-6 text-gray-300 group-hover:text-blue-400" />
                                            )}
                                        </div>
                                        <span className="font-bold text-sm uppercase tracking-wider">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-center">
                                <Button
                                    onClick={handleSavePreferences}
                                    disabled={selectedCategories.length < 1 || isSaving}
                                    className="rounded-xl px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50"
                                >
                                    {isSaving && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                                    Explore Recommended Events
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {hasPreferences && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-blue-600" />
                                Recommended Events
                            </h2>
                            <Button variant="ghost" className="text-blue-600 font-semibold hover:bg-blue-50">View Calendar</Button>
                        </div>

                        {events.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900">No events found</h3>
                                <p className="text-gray-500">Check back later for new activities.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {events.map((event) => (
                                    <Card key={event.id} className="rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none bg-white overflow-hidden group">
                                        {/* Colored Banner based on category */}
                                        <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                                            <div className="absolute top-4 left-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest border border-white/20">
                                                    {event.category?.name || 'Event'}
                                                </span>
                                            </div>
                                        </div>

                                        <CardContent className="p-6">
                                            <div className="mb-4">
                                                <h3 className="font-extrabold text-xl text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 mt-2 leading-relaxed">{event.description}</p>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium">{new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                                                </div>
                                            </div>

                                            <Button className="w-full rounded-xl py-6 bg-gray-900 hover:bg-blue-600 transition-colors text-white font-bold shadow-md hover:shadow-blue-500/25">
                                                View Details
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Admin Dashboard</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Users</CardTitle>
                        <Users className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">1,204</div>
                        <p className="text-[10px] font-bold text-green-600 mt-1 uppercase tracking-tighter">+20% this month</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Active Events</CardTitle>
                        <Calendar className="w-4 h-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-gray-900 group-hover:text-purple-600 transition-colors">45</div>
                        <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-tighter">8 pending approval</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">System Activity</CardTitle>
                        <Activity className="w-4 h-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors">High</div>
                        <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">Peak: 2:00 PM</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50">
                    <CardTitle className="text-lg font-bold">Role Management Context</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <RolesList />
                </CardContent>
            </Card>
        </div>
    );
}

// Simple cn utility if not available (though it is usually imported from @/lib/utils)
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
