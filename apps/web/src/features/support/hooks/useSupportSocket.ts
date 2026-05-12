import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export function useSupportSocket(ticketId: string | null, email?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!ticketId) return;

    console.log(`[SupportSocket] Connecting for ticket: ${ticketId}`);
    const socket: Socket = io(`${SOCKET_URL}/support`, {
      transports: ["polling", "websocket"],
    });

    socket.on("connect", () => {
      console.log(`[SupportSocket] Joined room: ticket:${ticketId}`);
      socket.emit("joinTicket", { ticketId });
    });

    socket.on("newMessage", (message) => {
      console.log("[SupportSocket] New message received via socket:", message);
      
      // Invalidate queries to trigger re-fetch
      queryClient.invalidateQueries({ queryKey: ["support-ticket", ticketId] });
      if (email) {
        queryClient.invalidateQueries({ queryKey: ["public-support-ticket", ticketId, email] });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, email, queryClient]);
}
