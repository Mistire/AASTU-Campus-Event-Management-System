"use client";

import { Activity } from 'lucide-react';
import { EventsList } from '@/features/events';

export default function EventsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">


                </div>
            </div>

            <EventsList />
        </div>
    );
}
