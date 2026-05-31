export type EventStatusName = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'LIVE' | 'CANCELLED' | 'ARCHIVED';

export interface EventStatus {
  id: string;
  statusName: EventStatusName;
  description?: string;
}

export interface EventType {
  id: string;
  name: string;
  description?: string;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  building?: string;
  roomNumber?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  capacity: number;
  status: EventStatus;
  eventType?: EventType | null;
  venue: Venue;
  createdBy: string;
  guestLimitPerUser?: number;
  organizers?: Array<{
    id: string;
    userId: string;
    status: string;
    user: {
      id: string;
      fullName: string;
      email: string;
    };
  }>;
  _count?: {
    registrations: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: EventStatusName;
  eventType?: string;
  venueId?: string;
  createdById?: string;
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

export interface EventFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  onSave: (data: any) => void;
  isSaving?: boolean;
}

