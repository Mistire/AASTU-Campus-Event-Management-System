"use client";

import { DiscoveryNavbar } from '@/features/discovery/components/DiscoveryNavbar';
import { SupportTracker } from '@/features/support/components/SupportTracker';
import { Suspense } from 'react';

export default function SupportTrackPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
            <DiscoveryNavbar />
            <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <Suspense fallback={
                    <div className="max-w-3xl mx-auto py-20 px-6 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Initialising Tracker...</p>
                    </div>
                }>
                    <SupportTracker />
                </Suspense>
            </div>
        </div>
    );
}
