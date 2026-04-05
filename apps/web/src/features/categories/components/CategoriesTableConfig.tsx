import { ColumnTypes } from '@/components/ui/data-table/data-table';
import { CategoryRecord } from '../types';
import { Tag as TagIcon } from 'lucide-react';

export const getCategoriesColumns = () => [
    ColumnTypes.text<CategoryRecord>('name', 'Category Name', {
        render: (val) => (
            <div className="flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-brand" />
                <span className="font-semibold text-gray-900">{String(val)}</span>
            </div>
        ),
        width: '30%'
    }),
    ColumnTypes.text<CategoryRecord>('description', 'Description', { width: '50%' }),
    ColumnTypes.text<CategoryRecord>('eventCount', 'Events', { align: 'center', width: '20%' }),
];
