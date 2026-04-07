import { ColumnTypes } from '@/components/ui/data-table/data-table.utils';
import { FeedbackRecord } from '../types';
import { User, Star } from 'lucide-react';

export const getFeedbackColumns = () => [
    ColumnTypes.text<FeedbackRecord>('userName', 'User', {
        render: (val) => (
            <div className="flex items-center gap-2 font-medium">
                <User className="w-4 h-4 text-brand" />
                {String(val)}
            </div>
        ),
        width: '20%'
    }),
    ColumnTypes.text<FeedbackRecord>('eventName', 'Event', { width: '25%' }),
    ColumnTypes.text<FeedbackRecord>('rating', 'Rating', {
        render: (val) => (
            <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                {String(val)}/5
            </div>
        ),
        width: '10%'
    }),
    ColumnTypes.text<FeedbackRecord>('comment', 'Comment', { 
        width: '35%', 
        render: (val) => <span className="italic text-gray-600">&quot;{String(val)}&quot;</span> 
    }),
    ColumnTypes.text<FeedbackRecord>('date', 'Date', { width: '10%', align: 'right' }),
];
