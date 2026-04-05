import { ColumnTypes } from '@/components/ui/data-table/data-table';
import { VenueRecord } from '../types';
import { Home } from 'lucide-react';

export const getVenuesColumns = () => [
    ColumnTypes.text<VenueRecord>('name', 'Venue Name', {
        render: (val) => (
            <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-brand" />
                <span className="font-semibold text-gray-900">{String(val)}</span>
            </div>
        ),
        width: '30%'
    }),
    ColumnTypes.text<VenueRecord>('building', 'Building', { width: '30%' }),
    ColumnTypes.text<VenueRecord>('roomNumber', 'Room', { width: '20%' }),
    ColumnTypes.text<VenueRecord>('capacity', 'Capacity', { align: 'right', width: '20%' }),
];
