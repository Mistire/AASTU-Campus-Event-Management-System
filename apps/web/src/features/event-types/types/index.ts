export interface EventTypeRecord {
    id: string;
    name: string;
    description: string | null;
    _count?: {
        events: number;
    };
}

export interface CreateEventTypeDTO {
    name: string;
    description?: string;
}

export interface UpdateEventTypeDTO {
    name?: string;
    description?: string;
}
