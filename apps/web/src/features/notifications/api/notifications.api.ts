import { apiFetch } from "@/lib/api-client";
import { 
  NotificationQuery, 
  NotificationResponse, 
  UnreadCountResponse 
} from "../types";

export const fetchNotifications = async (query: NotificationQuery = {}): Promise<NotificationResponse> => {
  const searchParams = new URLSearchParams();
  if (query.page) searchParams.append("page", query.page.toString());
  if (query.limit) searchParams.append("limit", query.limit.toString());
  if (query.isRead !== undefined) searchParams.append("isRead", query.isRead.toString());

  const res = await apiFetch(`/api/notifications?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  
  const result = await res.json();
  return result.data;
};

export const fetchUnreadCount = async (): Promise<number> => {
  const res = await apiFetch("/api/notifications/unread-count");
  if (!res.ok) throw new Error("Failed to fetch unread count");
  
  const result = await res.json();
  const data = result.data as UnreadCountResponse;
  return data.count;
};

export const markAsRead = async (id: string): Promise<void> => {
  const res = await apiFetch(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to mark notification as read");
};

export const markAllAsRead = async (): Promise<void> => {
  const res = await apiFetch("/api/notifications/read-all", {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to mark all notifications as read");
};

export const deleteNotification = async (id: string): Promise<void> => {
  const res = await apiFetch(`/api/notifications/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete notification");
};
