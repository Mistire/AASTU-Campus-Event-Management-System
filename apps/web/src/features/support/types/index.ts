export interface Ticket {
    id: string;
    subject: string;
    user: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    category: 'TECHNICAL' | 'FINANCIAL' | 'GENERAL_INQUIRY';
    date: string;
}
