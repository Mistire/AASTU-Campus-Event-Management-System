import { ColumnTypes } from '@/components/ui/data-table/data-table';
import { DepartmentRecord } from '../types';
import { GraduationCap } from 'lucide-react';

export const getDepartmentsColumns = () => [
    ColumnTypes.text<DepartmentRecord>('name', 'Department Name', {
        render: (val) => (
            <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand" />
                <span className="font-semibold text-gray-900">{String(val)}</span>
            </div>
        ),
        width: '35%'
    }),
    ColumnTypes.text<DepartmentRecord>('faculty', 'Faculty', { width: '45%' }),
    ColumnTypes.text<DepartmentRecord>('studentCount', 'Students', { align: 'right', width: '20%' }),
];
