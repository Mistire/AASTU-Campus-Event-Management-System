import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { ToastController } from "@/components/shared/ToastController";
import { Notification } from "../types";

// Connect directly to the API — bypasses Nginx (which causes 308 redirects on /socket.io)
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export function useNotificationSocket() {
  const { token, profile } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token || !profile) return;

    console.log("[NotificationSocket] Connecting to:", `${SOCKET_URL}/notifications`);

    const socket: Socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ["polling", "websocket"], // Allow polling first for better compatibility
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("[NotificationSocket] Connected successfully");
    });

    socket.on("notification", (data: Notification) => {
      console.log("[NotificationSocket] New notification received:", data);
      
      // Invalidate queries to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });

      // Show a toast
      ToastController.info({
        message: data.title,
        description: data.message,
      });
    });

    socket.on("connect_error", (err) => {
      console.error("[NotificationSocket] Connection error details:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("[NotificationSocket] Disconnected:", reason);
    });

    return () => {
      console.log("[NotificationSocket] Cleaning up connection");
      socket.disconnect();
    };
  }, [token, profile, queryClient]);
}
