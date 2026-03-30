import { Headset } from 'lucide-react';

export default function SupportPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Headset className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">SOS & Feedback</h1>
            </div>
            <p className="text-gray-500">View and respond to emergency alerts and community feedback.</p>
            <div className="h-64 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse" />
        </div>
    );
}
