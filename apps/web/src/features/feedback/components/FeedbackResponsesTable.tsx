"use client";

import { FeedbackResponse } from "../types";
import { ColumnDef } from "@tanstack/react-table";
import { Star, MessageSquare } from "lucide-react";
import { truncate } from "@/lib/utils";

export const getFeedbackResponseColumns = (): ColumnDef<FeedbackResponse>[] => [
    {
        id: "index",
        header: "No.",
        cell: ({ row }) => <span className="text-gray-500 font-medium">{row.index + 1}</span>,
        size: 50,
    },
    {
        accessorKey: "attendee",
        header: "Attendee",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 dark:text-white">
                    {row.original.attendee.displayName}
                </span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    {row.original.attendee.displayEmail}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "event",
        header: "Event",
        cell: ({ row }) => (
            <span className="text-sm font-black text-gray-900 dark:text-white">
                {truncate(row.original.event.title, 30)}
            </span>
        ),
    },
    {
        accessorKey: "answers",
        header: "Rating",
        cell: ({ row }) => {
            const ratingAnswer = row.original.answers.find(
                (a) => a.question?.type === "RATING"
            );
            if (!ratingAnswer) return <span className="text-gray-300 dark:text-gray-600 text-xs italic">N/A</span>;
            return (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-100 dark:border-amber-500/20 shadow-sm w-fit">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black text-amber-700 dark:text-amber-400">{ratingAnswer.value}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "responseCount",
        header: "Answers",
        cell: ({ row }) => (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 w-fit">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-black text-gray-600 dark:text-gray-400">{row.original.answers.length}</span>
            </div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {new Date(row.original.createdAt).toLocaleDateString()}
            </span>
        ),
    },
];
