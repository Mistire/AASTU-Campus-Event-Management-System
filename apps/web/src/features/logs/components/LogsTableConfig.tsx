import { ColumnTypes, CellRenderers } from '@/components/ui/data-table/data-table.utils';
import { LogEntry } from '../types';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export const getLogsColumns = () => [
    ColumnTypes.text<LogEntry>('timestamp', 'Timestamp', { width: '20%' }),
    ColumnTypes.text<LogEntry>('level', 'Level', {
        render: (val: unknown) => {
            const level = String(val);
            let Icon = Info;

            if (level === 'ERROR') { Icon = AlertCircle; }
            if (level === 'WARNING') { Icon = AlertCircle; }
            if (level === 'SUCCESS') { Icon = CheckCircle2; }

            return (
                <div className="flex items-center gap-1.5 font-bold text-[10px] text-(--brand) bg-(--brand-subtle) px-2 py-0.5 rounded border border-(--brand)/20">
                    <Icon className="w-3 h-3" />
                    {level}
                </div>
            );
        },
        width: '12%'
    }),
    ColumnTypes.text('event', 'Event Name', {
        render: (val) => <span className="font-semibold text-gray-900">{String(val)}</span>,
        width: '18%'
    }),
    ColumnTypes.text('user', 'Performed By', { width: '15%' }),
    ColumnTypes.text('details', 'Description', {
        render: (val) => CellRenderers.truncate(String(val), 60),
        width: '35%'
    }),
];
