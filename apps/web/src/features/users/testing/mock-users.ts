import { UserRecord } from "../types";

export const mockUsers: UserRecord[] = [
    { id: '1', name: 'Abebe Bikila', email: 'abebe.b@aastu.edu.et', role: 'ADMIN', status: 'active', joined: '2025-09-01' },
    { id: '2', name: 'Martha Tadesse', email: 'martha.t@aastu.edu.et', role: 'ORGANIZER', status: 'active', joined: '2025-09-15' },
    { id: '3', name: 'Kebede Molla', email: 'kebede.m@aastu.edu.et', role: 'STUDENT', status: 'pending', joined: '2026-01-10' },
    { id: '4', name: 'Sara Lemma', email: 'sara.l@aastu.edu.et', role: 'STAFF', status: 'inactive', joined: '2025-10-20' },
    { id: '5', name: 'Yonas Berhane', email: 'yonas.b@aastu.edu.et', role: 'ORGANIZER', status: 'active', joined: '2025-11-05' },
];
