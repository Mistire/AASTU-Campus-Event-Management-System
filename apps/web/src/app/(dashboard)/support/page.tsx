import { Headset, Plus, Search, MessageSquare } from 'lucide-react';
import { DataTable, ColumnTypes, BadgeConfigs } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';

interface Ticket {
    id: string;
    subject: string;
    user: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    category: 'TECHNICAL' | 'FINANCIAL' | 'GENERAL_INQUIRY';
    date: string;
}

const mockTickets: Ticket[] = [
    { id: 'T-1001', subject: 'Login issue with student ID', user: 'Dawit Yohannes', priority: 'HIGH', status: 'OPEN', category: 'TECHNICAL', date: '2026-03-30 09:45' },
    { id: 'T-1002', subject: 'Event registration refund', user: 'Etenesh Haile', priority: 'MEDIUM', status: 'IN_PROGRESS', category: 'FINANCIAL', date: '2026-03-29 14:20' },
    { id: 'T-1003', subject: 'How to create a multi-day event?', user: 'Prof. Tadesse', priority: 'LOW', status: 'RESOLVED', category: 'GENERAL_INQUIRY', date: '2026-03-28 11:10' },
    { id: 'T-1004', subject: 'System crash during checkout', user: 'Mulugeta Belay', priority: 'CRITICAL', status: 'OPEN', category: 'TECHNICAL', date: '2026-03-31 08:05' },
];

export default function SupportPage() {
    const columns = [
        ColumnTypes.text('id', 'ID', { width: '10%' }),
        ColumnTypes.text('subject', 'Subject', {
            render: (val, record: Ticket) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{record.subject}</span>
                    <span className="text-xs text-gray-500">{record.user}</span>
                </div>
            ),
            width: '35%'
        }),
        ColumnTypes.badge('category', 'Category', {
            render: (val: unknown) => {
                const config = BadgeConfigs.ticket.category[val as keyof typeof BadgeConfigs.ticket.category];
                return (
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-tighter ${config?.className}`}>
                        {String(val).replace('_', ' ')}
                    </div>
                );
            },
            width: '15%'
        }),
        ColumnTypes.badge('priority', 'Priority', {
            render: (val: unknown) => {
                const config = BadgeConfigs.ticket.priority[val as keyof typeof BadgeConfigs.ticket.priority];
                return (
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${config?.className}`}>
                        {String(val)}
                    </div>
                );
            },
            width: '15%'
        }),
        ColumnTypes.badge('status', 'Status', {
            render: (val: unknown) => {
                const statusKey = String(val) as keyof typeof BadgeConfigs.ticket.status;
                const config = BadgeConfigs.ticket.status[statusKey] || BadgeConfigs.ticket.status.OPEN;
                return (
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
                        {config.label}
                    </div>
                );
            },
            width: '15%'
        }),
    ];

    const actions = [
        { key: 'reply', label: 'Reply', icon: <MessageSquare className="w-4 h-4" />, onClick: (record: Ticket) => console.log('Reply', record) },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Headset className="w-8 h-8 text-brand" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">SOS & Feedback</h1>
                        <p className="text-gray-500 text-sm">Manage emergency alerts and support tickets.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-gray-200">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                    <Button className="rounded-xl bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20">
                        <Plus className="w-4 h-4 mr-2" />
                        New Ticket
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <DataTable 
                    data={mockTickets} 
                    columns={columns} 
                    actions={actions}
                    pagination={{ pageSize: 5, showTotal: true }}
                    hoverable
                />
            </div>
        </div>
    );
}
