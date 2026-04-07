"use client";

import { MessageSquare } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { mockFeedback } from '@/features/feedback/testing/mock-feedback';
import { getFeedbackColumns } from '@/features/feedback/components/FeedbackTableConfig';

export default function FeedbackPage() {
    const columns = getFeedbackColumns();

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
