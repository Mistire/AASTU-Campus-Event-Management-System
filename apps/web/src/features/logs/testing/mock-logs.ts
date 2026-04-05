import { LogEntry } from "../types";

export const mockLogs: LogEntry[] = [
    { id: '101', level: 'SUCCESS', event: 'Event Approved', user: 'Admin. Abebe', timestamp: '2026-03-31 10:15:22', details: 'Freshman Welcome Night approved by Admin.' },
    { id: '102', level: 'INFO', event: 'User Login', user: 'Dawit Y.', timestamp: '2026-03-31 10:10:05', details: 'Standard login from IP 192.168.1.45' },
    { id: '103', level: 'ERROR', event: 'Payment Failed', user: 'Sara L.', timestamp: '2026-03-31 09:55:12', details: 'CBE Birr API timeout during transaction #45892' },
    { id: '104', level: 'WARNING', event: 'Capacity Limit', user: 'System', timestamp: '2026-03-31 09:45:00', details: 'Tech Expo registration reached 90% capacity' },
    { id: '105', level: 'INFO', event: 'New Registration', user: 'Mulugeta B.', timestamp: '2026-03-31 09:30:45', details: 'Registered for Inter-College Sports' },
];
