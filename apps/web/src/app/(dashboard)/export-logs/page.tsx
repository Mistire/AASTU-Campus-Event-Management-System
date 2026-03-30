import { FileDown } from 'lucide-react';

export default function LogsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <FileDown className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics Logs</h1>
            </div>
            <p className="text-gray-500">Analyze system logs and export event data.</p>
            <div className="h-64 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse" />
        </div>
    );
}
