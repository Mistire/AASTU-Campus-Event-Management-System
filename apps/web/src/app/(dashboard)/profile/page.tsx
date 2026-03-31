'use client';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Mail, Shield, Phone, Calendar, BadgeCheck, Loader2, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const { profile } = useAuthStore();
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            if (!profile || profile.role !== 'STUDENT') {
                setIsLoadingCategories(false);
                return;
            }
            try {
                // Fetch individually to handle potential 500 errors gracefully
                const catRes = await api.get('/categories');
                setCategories(catRes.data.data || []);

                try {
                    const prefRes = await api.get('/users/categories/preferences');
                    const prefs = prefRes.data.data || [];
                    setSelectedCategories(prefs.map((p: any) => p.categoryId));
                } catch (prefErr: any) {
                    console.error('Failed to fetch preferences', prefErr);
                    setFetchError('Failed to load your category preferences. Please try again later.');
                }
            } catch (err: any) {
                console.error('Failed to fetch categories', err);
                setFetchError('Failed to load available categories. The server might be experiencing issues.');
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
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
            // Optionally show a success toast here
        } catch (err) {
            console.error('Failed to save preferences', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 opacity-50" />

                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/20 z-10">
                    {profile.fullName.charAt(0)}
                </div>

                <div className="flex-1 z-10">
                    <h1 className="text-3xl font-extrabold text-gray-900">{profile.fullName}</h1>
                    <div className="flex flex-wrap gap-3 mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 uppercase tracking-wider">
                            {profile.role}
                        </span>
                        {profile.permissions.slice(0, 3).map(p => (
                            <span key={p} className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-100 uppercase tracking-widest">
                                <BadgeCheck className="w-3 h-3 mr-1" />
                                {p.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                </div>

                <Button className="rounded-xl shadow-md px-6 bg-gray-900 hover:bg-black transition-all">
                    Edit Profile
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="rounded-3xl border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email Address</p>
                                <p className="text-sm font-semibold text-gray-900">{profile.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Phone Number</p>
                                <p className="text-sm font-semibold text-gray-900">{profile.phone || 'Not provided'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            Account Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Member Since</p>
                                <p className="text-sm font-semibold text-gray-900">March 2026</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Verification Status</p>
                                <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                    <BadgeCheck className="w-4 h-4" />
                                    Verified Account
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Areas of Interest Management (For Students) */}
            {profile.role === 'STUDENT' && (
                <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                    Areas of Interest
                                </CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Manage the types of events you want to see recommended.</p>
                            </div>
                            <Button
                                onClick={handleSavePreferences}
                                disabled={isSaving || selectedCategories.length === 0 || isLoadingCategories || !!fetchError}
                                className="rounded-xl px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md hover:shadow-blue-500/20 transition-all"
                            >
                                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Save Preferences
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {isLoadingCategories ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                            </div>
                        ) : fetchError ? (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium text-center">
                                {fetchError}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {categories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        onClick={() => handleToggleCategory(cat.id)}
                                        className={cn(
                                            "group cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3",
                                            selectedCategories.includes(cat.id)
                                                ? "bg-blue-600 border-blue-600 text-white shadow-md"
                                                : "bg-white border-gray-100 hover:border-blue-200 text-gray-700 hover:bg-gray-50/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                            selectedCategories.includes(cat.id) ? "bg-white/20" : "bg-gray-100 group-hover:bg-blue-100"
                                        )}>
                                            {selectedCategories.includes(cat.id) ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                            )}
                                        </div>
                                        <span className="font-bold text-xs uppercase tracking-wider">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
