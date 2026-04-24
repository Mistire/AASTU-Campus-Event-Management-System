export interface LogEntry {
    id: string;
    action: string;
    entityType: string;
    entityId?: string;
    role?: string;
    ipAddress?: string;
    userAgent?: string;
    outcome: 'SUCCESS' | 'FAILURE';
    beforeState?: any;
    afterState?: any;
    details?: string;
    environment?: string;
    createdAt: string;
    user: {
        fullName: string;
        email: string;
        role?: any;
    };
}
