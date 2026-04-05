import { ColumnTypes, BadgeConfigs } from '@/components/ui/data-table/data-table';
import { UserRecord } from '../types';
import { Shield } from 'lucide-react';

export const getUsersColumns = () => [
    ColumnTypes.text<UserRecord>('name', 'User', {
        render: (_val: unknown, record: UserRecord) => (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-subtle flex items-center justify-center text-brand text-xs font-bold ring-1 ring-brand/20">
                    {record.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{record.name}</span>
                    <span className="text-xs text-gray-500">{record.email}</span>
                </div>
            </div>
        )
    }),
    ColumnTypes.text('role', 'Role', {
        render: (val: unknown) => (
            <div className="flex items-center gap-1.5 font-medium text-gray-700">
                <Shield className="w-3.5 h-3.5 text-brand" />
                <span className="text-xs uppercase tracking-wider">{String(val)}</span>
            </div>
        )
    }),
    ColumnTypes.badge('status', 'Status', {
        render: (val: unknown) => {
            const statusKey = String(val) as keyof typeof BadgeConfigs.status;
            const config = BadgeConfigs.status[statusKey] || BadgeConfigs.status.pending;
            return (
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
                    {config.label}
                </div>
            );
        }
    }),
    ColumnTypes.text('joined', 'Joined Date'),
];
