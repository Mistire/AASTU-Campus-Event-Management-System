'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RolesList } from '@/features/dashboard/components/RolesList';
import api from '@/lib/axios';
import {
    CheckCircle2,
    Circle,
    Sparkles,
    Calendar,
    Users,
    Activity,
    Loader2,
    ShieldCheck,
    Headset,
    LayoutDashboard,
    ArrowRight,
    TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardStats {
    totalUsers: number;
    totalStudents: number;
    activeEvents: number;
    pendingEvents: number;
    systemHealth: string;
    supportTickets: number;
}

export default function DashboardPage() {
    const { profile } = useAuthStore();
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasPreferences, setHasPreferences] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!profile) return;
            setLoading(true);

            try {
                // Parallel fetching for performance
                const promises = [];

                // Admin Stats
                if (['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
                    promises.push(
                        api.get('/admin/stats').then(res => setStats(res.data?.data || res.data)).catch(e => console.error('Stats error', e))
                    );
                }

                // Categories
                promises.push(
                    api.get('/categories').then(res => {
                        const cats = res.data?.data || res.data || [];
                        setCategories(Array.isArray(cats) ? cats : []);
                    }).catch(e => console.error('Categories error', e))
                );

                // Student Specifics
                if (profile.role === 'STUDENT') {
                    promises.push(
                        api.get('/users/categories/preferences').then(res => {
                            const prefs = res.data?.data || res.data || [];
                            if (Array.isArray(prefs) && prefs.length > 0) {
                                setSelectedCategories(prefs.map((p: any) => p.categoryId || p.id));
                                setHasPreferences(true);
                            }
                        }).catch(e => console.error('Prefs error', e))
                    );

                    promises.push(
                        api.get('/events/upcoming').then(res => {
                            const evts = res.data?.data || res.data || [];
                            setEvents(Array.isArray(evts) ? evts : []);
                        }).catch(e => console.error('Events error', e))
                    );
                }

                await Promise.all(promises);
            } catch (err) {
                console.error('Dashboard fetchData error:', err);
            } finally {
                setLoading(false);
            }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (profile?.role === 'STUDENT') {
        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex flex-col gap-2 p-2">
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
                            <p className="text-sm text-blue-700/70 mt-1">Select categories you're interested in to get better recommendations.</p>
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

                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-blue-600" />
                            {hasPreferences ? 'Recommended Events' : 'Upcoming Events'}
                        </h2>
                        <Button variant="ghost" onClick={() => window.location.href = '/events'} className="text-blue-600 font-semibold hover:bg-blue-50">View All</Button>
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
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="relative z-10 flex flex-col gap-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 w-fit mb-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">{profile?.role || 'Admin'} View</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                        AASTU <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Control Center</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Manage events, users, and overall campus activity</p>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <Button onClick={() => window.location.href = '/events'} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 font-bold px-6 py-6 h-auto transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Create Event
                    </Button>
                </div>
            </div>

            {/* Quick Stats overview */}
            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        title: 'Total Users',
                        value: stats?.totalUsers ?? '...',
                        trend: 'Registered accounts',
                        icon: Users,
                        color: 'blue'
                    },
                    {
                        title: 'Active Events',
                        value: stats?.activeEvents ?? '...',
                        trend: `${stats?.pendingEvents ?? 0} pending approval`,
                        icon: Calendar,
                        color: 'indigo'
                    },
                    {
                        title: 'System Health',
                        value: stats?.systemHealth ?? 'Optimal',
                        trend: 'All services running',
                        icon: Activity,
                        color: 'emerald'
                    },
                    {
                        title: 'Total Students',
                        value: stats?.totalStudents ?? '...',
                        trend: `${((stats?.totalStudents ?? 0) / (stats?.totalUsers || 1) * 100).toFixed(0)}% of users`,
                        icon: TrendingUp,
                        color: 'orange'
                    },
                ].map((stat, i) => (
                    <Card key={i} className={`rounded-3xl border-none shadow-sm bg-white overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                        <CardContent className="p-6 relative">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500`}></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">{stat.title}</h3>
                                    <div className={`w-8 h-8 rounded-full bg-${stat.color}-100 flex items-center justify-center text-${stat.color}-600`}>
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-2 text-3xl font-extrabold text-gray-900">{stat.value}</div>
                                <p className={`text-xs font-bold text-${stat.color}-600 mt-2 tracking-wide`}>{stat.trend}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Management Modules */}
            <h2 className="text-xl font-extrabold text-gray-900 mt-10 mb-6 flex items-center gap-2 px-2">
                <LayoutDashboard className="w-6 h-6 text-blue-600" />
                Management Modules
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
                <div onClick={() => window.location.href = '/users'} className="group cursor-pointer bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full transition-transform group-hover:scale-125 duration-700"></div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                        <Users className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">User Management</h3>
                    <p className="text-gray-500 font-medium leading-relaxed mb-6">Manage roles, permissions, departments, and approve new organizer accounts. Full control over the campus directory.</p>
                    <div className="flex items-center text-blue-600 font-bold text-sm tracking-wide">
                        Manage Users <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>

                <div onClick={() => window.location.href = '/events'} className="group cursor-pointer bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full transition-transform group-hover:scale-125 duration-700"></div>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                        <Calendar className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">Event Control</h3>
                    <p className="text-gray-500 font-medium leading-relaxed mb-6">Review pending event requests, manage venues, update categories, and oversee all campus activities in one place.</p>
                    <div className="flex items-center text-indigo-600 font-bold text-sm tracking-wide">
                        Manage Events <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>

            <Card className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white mt-8">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-extrabold text-gray-900">Security & Roles Context</CardTitle>
                        <p className="text-sm text-gray-500 font-medium mt-1">Live overview of available roles and mapped permissions</p>
                    </div>
                    <Button variant="outline" className="rounded-xl font-bold bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900">Edit Roles</Button>
                </CardHeader>
                <CardContent className="p-0">
                    <RolesList />
                </CardContent>
            </Card>
        </div>
    );
}
