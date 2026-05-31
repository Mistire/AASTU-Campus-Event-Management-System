import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { 
  AttendanceRecord, 
  AttendanceStats, 
  GlobalAttendanceStats, 
  EventParticipation 
} from "../types/attendance";

export type { AttendanceRecord, AttendanceStats, GlobalAttendanceStats, EventParticipation };

export const useAttendance = (eventId: string) => {
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendance", eventId],
    queryFn: async () => {
      const res = await apiFetch(`/api/attendance/event/${eventId}`);
      if (!res.ok) throw new Error("Failed to fetch attendance");
      const result = await res.json();
      return result.data;
    },
    enabled: !!eventId,
  });
};

export const useAttendanceStats = (eventId: string) => {
  return useQuery<AttendanceStats>({
    queryKey: ["attendance-stats", eventId],
    queryFn: async () => {
      const res = await apiFetch(`/api/attendance/stats/${eventId}`);
      if (!res.ok) throw new Error("Failed to fetch attendance stats");
      const result = await res.json();
      return result.data;
    },
    enabled: !!eventId,
  });
};

export const useGlobalAttendanceStats = () => {
  return useQuery<GlobalAttendanceStats>({
    queryKey: ["global-attendance-stats"],
    queryFn: async () => {
      const res = await apiFetch(`/api/attendance/global/summary`);
      if (!res.ok) throw new Error("Failed to fetch global stats");
      const result = await res.json();
      return result.data;
    },
  });
};

export const useEventsParticipation = () => {
  return useQuery<EventParticipation[]>({
    queryKey: ["events-participation"],
    queryFn: async () => {
      const res = await apiFetch(`/api/attendance/global/participation`);
      if (!res.ok) throw new Error("Failed to fetch participation data");
      const result = await res.json();
      return result.data;
    },
  });
};

export const useRecentGlobalAttendance = () => {
  return useQuery<AttendanceRecord[]>({
    queryKey: ["recent-global-attendance"],
    queryFn: async () => {
      const res = await apiFetch(`/api/attendance/global/recent`);
      if (!res.ok) throw new Error("Failed to fetch recent attendance");
      const result = await res.json();
      return result.data;
    },
  });
};
