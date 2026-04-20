import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { ToastController } from "@/components/shared/ToastController";
import { Notification } from "../types";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function useNotificationSocket() {
  const { token, profile } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token || !profile) return;

    const socket: Socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      query: { token }, // Gateway checks both
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("[NotificationSocket] Connected");
    });

    socket.on("notification", (data: Notification) => {
      console.log("[NotificationSocket] New notification:", data);
      
      // 1. Invalidate queries to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });

      // 2. Show a toast
      ToastController.info({
        message: data.title,
        description: data.message,
      });
    });

    socket.on("connect_error", (err) => {
      console.error("[NotificationSocket] Connection error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, profile, queryClient]);
}
