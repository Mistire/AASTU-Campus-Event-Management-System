export interface Ticket {
    id: string;
    subject: string;
    description?: string;
    category: 'TECHNICAL' | 'ACCOUNT' | 'EVENT_ISSUE' | 'EMERGENCY' | 'OTHER';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    createdAt: string;
    userId?: string | null;
    guestName?: string | null;
    guestEmail?: string | null;
    user?: {
        fullName: string;
        email: string;
    } | null;
    messages?: any[];
    _count?: {
        messages: number;
    };
}
