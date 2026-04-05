import { Ticket } from "../types";

export const mockTickets: Ticket[] = [
    { id: 'T-1001', subject: 'Login issue with student ID', user: 'Dawit Yohannes', priority: 'HIGH', status: 'OPEN', category: 'TECHNICAL', date: '2026-03-30 09:45' },
    { id: 'T-1002', subject: 'Event registration refund', user: 'Etenesh Haile', priority: 'MEDIUM', status: 'IN_PROGRESS', category: 'FINANCIAL', date: '2026-03-29 14:20' },
    { id: 'T-1003', subject: 'How to create a multi-day event?', user: 'Prof. Tadesse', priority: 'LOW', status: 'RESOLVED', category: 'GENERAL_INQUIRY', date: '2026-03-28 11:10' },
    { id: 'T-1004', subject: 'System crash during checkout', user: 'Mulugeta Belay', priority: 'CRITICAL', status: 'OPEN', category: 'TECHNICAL', date: '2026-03-31 08:05' },
];
