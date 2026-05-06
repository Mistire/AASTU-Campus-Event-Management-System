export interface Ticket {
    id: string;
    subject: string;
    category: 'TECHNICAL' | 'ACCOUNT' | 'EVENT_ISSUE' | 'EMERGENCY' | 'OTHER';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    createdAt: string;
    user: {
        fullName: string;
        email: string;
    };
}
