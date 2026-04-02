"use client";

import { MessageSquare, Star, User } from 'lucide-react';
import { DataTable, ColumnTypes } from '@/components/ui/data-table/data-table';

interface FeedbackRecord {
    id: string;
    userName: string;
    eventName: string;
    rating: number;
    comment: string;
    date: string;
}

const mockFeedback: FeedbackRecord[] = [
    { id: '1', userName: 'Abebe B.', eventName: 'Tech Expo 2026', rating: 5, comment: 'Amazing event! The speakers were top-notch.', date: '2026-03-31' },
    { id: '2', userName: 'Martha T.', eventName: 'Freshman Night', rating: 4, comment: 'Great music, but the hall was a bit crowded.', date: '2026-03-30' },
    { id: '3', userName: 'Kebede M.', eventName: 'Sports Tournament', rating: 3, comment: 'The game scheduling could be better.', date: '2026-03-29' },
    { id: '4', userName: 'Sara L.', eventName: 'Career Seminar', rating: 5, comment: 'Extremely helpful for my future career.', date: '2026-03-28' },
];

export default function FeedbackPage() {
    const columns = [
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
        ColumnTypes.text<FeedbackRecord>('comment', 'Comment', { width: '35%', render: (val) => <span className="italic text-gray-600">"{String(val)}"</span> }),
        ColumnTypes.text<FeedbackRecord>('date', 'Date', { width: '10%', align: 'right' }),
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-brand" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Feedback</h1>
                        <p className="text-gray-500 text-sm">Review event submissions and user experiences.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <DataTable
                    data={mockFeedback}
                    columns={columns}
                    pagination={{ pageSize: 10, showTotal: true }}
                    hoverable
                />
            </div>
        </div>
    );
}
