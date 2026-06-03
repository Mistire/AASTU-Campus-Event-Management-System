export interface Department {
    id: string;
    name: string;
    faculty?: string;
    _count?: {
        users: number;
    };
}

