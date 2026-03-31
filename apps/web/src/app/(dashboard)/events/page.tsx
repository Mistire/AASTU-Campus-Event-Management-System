import { Activity } from 'lucide-react';

export default function EventsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Events Control</h1>
            </div>
            <p className="text-gray-500">Manage all campus events from this central control panel.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse" />
                ))}
            </div>
        </div>
    );
}
