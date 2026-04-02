export type EventStatusName = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'LIVE' | 'CANCELLED' | 'ARCHIVED';

export interface EventStatus {
  id: string;
  statusName: EventStatusName;
  description?: string;
}

export interface EventType {
  id: string;
  typeName: string;
  description?: string;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  capacity: number;
  status: EventStatus;
  eventType: EventType;
  venue: Venue;
  _count?: {
    registrations: number;
  };
}

export interface EventQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: EventStatusName;
  eventType?: string;
  sortBy?: 'date' | 'popularity';
}

export interface PaginatedEventsResponse {
  data: Event[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: Record<EventStatusName, number>;
  };
}
