"use client";

import { Activity, Plus } from 'lucide-react';
import { EventsList } from '@/features/events';
import { ButtonController } from '@/components/controllers/ButtonController';

export default function EventsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-(--brand)" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Events Management</h1>
                        <p className="text-gray-500 text-sm">Monitor campus happenings with real-time aggregates.</p>
                    </div>
                </div>
                <ButtonController className="rounded-xl shadow-lg shadow-(--brand)/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Event
                </ButtonController>
            </div>

            <EventsList />
        </div>
    );
}
