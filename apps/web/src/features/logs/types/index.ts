export interface LogEntry {
    id: string;
    level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    event: string;
    user: string;
    timestamp: string;
    details: string;
}
