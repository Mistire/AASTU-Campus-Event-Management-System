import { ColumnTypes, BadgeConfigs } from '@/components/ui/data-table/data-table.utils';
import { Ticket } from '../types';
import { MessageSquare } from 'lucide-react';

export const getSupportColumns = () => [
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

export const getSupportActions = (onReply: (record: Ticket) => void) => [
    { key: 'reply', label: 'Reply', icon: <MessageSquare className="w-4 h-4" />, onClick: onReply },
];
