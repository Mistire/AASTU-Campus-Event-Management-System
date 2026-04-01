import { Activity, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { DataTable, ColumnTypes, BadgeConfigs } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';

interface Event {
    id: string;
    title: string;
    type: string;
    date: string;
    venue: string;
    status: 'active' | 'pending' | 'completed' | 'cancelled';
    capacity: string;
}

const mockEvents: Event[] = [
    { id: '1', title: 'AASTU Tech Expo 2026', type: 'Exhibition', date: '2026-05-15', venue: 'Block 40, Main Hall', status: 'pending', capacity: '450/500' },
    { id: '2', title: 'Freshman Welcome Night', type: 'Social', date: '2026-04-10', venue: 'Student Center', status: 'active', capacity: '1200/1500' },
    { id: '3', title: 'Inter-College Sports Tournament', type: 'Sports', date: '2026-06-20', venue: 'Gymnasium & Field', status: 'active', capacity: '500/800' },
    { id: '4', title: 'AI & Robotics Workshop', type: 'Educational', date: '2026-03-25', venue: 'Lab 2, ICT Center', status: 'completed', capacity: '50/50' },
    { id: '5', title: 'Career Development Seminar', type: 'Workshop', date: '2026-05-02', venue: 'Auditorium', status: 'cancelled', capacity: '0/200' },
];

export default function EventsPage() {
    const columns = [
        ColumnTypes.text('title', 'Event Name', { 
            render: (_val: unknown, record: Event) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{record.title}</span>
                    <span className="text-xs text-gray-500">{record.type}</span>
                </div>
            ),
            width: '30%'
        }),
        ColumnTypes.text('date', 'Date', { width: '15%' }),
        ColumnTypes.text('venue', 'Venue', { width: '20%' }),
        ColumnTypes.badge('status', 'Status', {
            render: (val: unknown) => {
                const statusKey = String(val) as keyof typeof BadgeConfigs.status;
                const config = BadgeConfigs.status[statusKey] || BadgeConfigs.status.pending;
                return (
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
                        {config.label}
                    </div>
                );
            },
            width: '15%'
        }),
        ColumnTypes.text('capacity', 'Capacity', { width: '10%' }),
    ];

    const actions = [
        { key: 'view', label: 'View', icon: <Eye className="w-4 h-4" />, onClick: (record: Event) => console.log('View', record) },
        { key: 'edit', label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: (record: Event) => console.log('Edit', record) },
        { key: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4 text-red-500" />, onClick: (record: Event) => console.log('Delete', record) },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-(--brand)" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Events Control</h1>
                        <p className="text-gray-500 text-sm">Manage and monitor all campus happenings.</p>
                    </div>
                </div>
                <Button className="rounded-xl shadow-lg shadow-(--brand)/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Event
                </Button>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <DataTable 
                    data={mockEvents} 
                    columns={columns} 
                    actions={actions}
                    pagination={{ pageSize: 10, showTotal: true }}
                    hoverable
                />
            </div>
        </div>
    );
}
