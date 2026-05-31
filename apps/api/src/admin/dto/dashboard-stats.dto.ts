export class RegistrationStatusCountDto {
  status: string;
  count: number;
}

export class AdminDashboardStatsDto {
  users: number;
  events: number;
  registrations: number;
  venues: number;
  categories: number;
  totalAttendance: number;
  approvedRegistrations: number;
  pendingRegistrations: number;
  registrationsToday: number;
  registrationStatusBreakdown: RegistrationStatusCountDto[];
}