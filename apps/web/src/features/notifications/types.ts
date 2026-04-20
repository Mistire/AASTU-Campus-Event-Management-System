export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationResponse {
  data: Notification[];
  meta: NotificationMeta;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
}
