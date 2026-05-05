export class TrendPointDto {
  date: string;
  count: number;
}

export class AdminOverviewDto {
  totalEvents: number;
  totalUsers: number;
  totalRegistrations: number;
  totalAttendance: number;
  approvedRegistrations: number;
  pendingRegistrations: number;
}

export class OrganizerOverviewDto {
  totalEvents: number;
  totalRegistrations: number;
  pendingApprovals: number;
  totalAttendance: number;
}

export class TopEventDto {
  eventId: string;
  title: string;
  registrations: number;
  attendance: number;
  attendanceRate: number;
}

export class CategoryAnalyticsDto {
  categoryId: string;
  name: string;
  registrations: number;
  attendanceRate: number;
}

export class DepartmentAnalyticsDto {
  departmentId: string;
  name: string;
  registrations: number;
}

export class UserEngagementDto {
  activeUsers: number;
  repeatEngagement: { bucket: string; count: number }[];
  newUserGrowth: TrendPointDto[];
  waitlistTotal: number;
  waitlistPromoted: number;
}

export class EventAnalyticsDto {
  eventId: string;
  title: string;
  totalRegistrations: number;
  confirmedRegistrations: number;
  cancelledRegistrations: number;
  attendanceCount: number;
  attendanceRate: number;
}

export class SessionAnalyticsDto {
  sessionId: string;
  title: string;
  checkIns: number;
}

export class FeedbackAnalyticsDto {
  averageRating: number;
  totalFeedback: number;
  distribution: { score: number; count: number }[];
}

export class ArchivedEventDto {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: string;
  totalRegistrations: number;
  attendanceCount: number;
  attendanceRate: number;
  averageRating: number;
  organizerName?: string;
}
