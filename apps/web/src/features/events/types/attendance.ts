export interface AttendanceRecord {
  id: string;
  userId: string;
  eventId: string;
  sessionId?: string;
  checkInTime: string;
  user: {
    fullName: string;
    email: string;
    studentId?: string;
  };
  session?: {
    title: string;
  };
  event: {
    title: string;
  };
}

export interface AttendanceStats {
  totalRegistrations: number;
  totalCheckins: number;
  attendanceRate: number;
}

export type GlobalAttendanceStats = {
  totalCheckinsToday: number;
  activeEvents: number;
  engagementTrend: string;
};

export type EventParticipation = {
  id: string;
  title: string;
  startTime: string;
  registrations: number;
  checkins: number;
  rate: number;
};
