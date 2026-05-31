import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { AdminOverviewDto, EventAnalyticsDto } from './dto/response.dto';
import { ROLES_KEY } from '../auth/decorator/roles.decorator';

// ─── Mock AnalyticsService ────────────────────────────────────────────────────

const mockAnalyticsService = {
  getAdminOverview: jest.fn(),
  getTopEvents: jest.fn(),
  getCategoryAnalytics: jest.fn(),
  getDepartmentAnalytics: jest.fn(),
  getAdminTrends: jest.fn(),
  getUserEngagement: jest.fn(),
  exportAnalytics: jest.fn(),
  getEventAnalytics: jest.fn(),
  getSessionAnalytics: jest.fn(),
  getFeedbackAnalytics: jest.fn(),
  getEventTrends: jest.fn(),
};

// ─── Guard factories ──────────────────────────────────────────────────────────

/** A guard that always rejects (simulates missing/invalid JWT) */
const rejectingJwtGuard = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate: (_ctx: ExecutionContext) => {
    throw new UnauthorizedException();
  },
};

/** A guard that always rejects with 403 (simulates wrong role) */
const rejectingRolesGuard = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate: (_ctx: ExecutionContext) => {
    throw new ForbiddenException();
  },
};

/** A guard that always allows */
const allowingGuard = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate: (_ctx: ExecutionContext) => true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function buildModule(
  jwtGuard: object = allowingGuard,
  rolesGuard: object = allowingGuard,
): Promise<TestingModule> {
  return Test.createTestingModule({
    controllers: [AnalyticsController],
    providers: [{ provide: AnalyticsService, useValue: mockAnalyticsService }],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(jwtGuard)
    .overrideGuard(RolesGuard)
    .useValue(rolesGuard)
    .compile();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AnalyticsController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── a. Guard registration checks ───────────────────────────────────────────

  describe('Controller Guards & Roles Decorators', () => {
    it('should be decorated with JwtAuthGuard and RolesGuard', () => {
      const guards = Reflect.getMetadata('__guards__', AnalyticsController);
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(RolesGuard);
    });

    it('getAdminOverview should be decorated with Roles("Admin")', () => {
      const roles = Reflect.getMetadata(ROLES_KEY, AnalyticsController.prototype.getAdminOverview);
      expect(roles).toEqual(['Admin']);
    });
  });

  // ── c. 403 for organizer accessing another's event ──────────────────────────

  describe("403 — organizer accessing another organizer's event", () => {
    it('throws ForbiddenException when service rejects ownership', async () => {
      const module = await buildModule();
      const controller = module.get<AnalyticsController>(AnalyticsController);

      mockAnalyticsService.getEventAnalytics.mockRejectedValue(
        new ForbiddenException('You are not an organizer of this event'),
      );

      const user = {
        id: 'other-user',
        email: 'other@test.com',
        fullName: 'Other User',
        role: 'Organizer',
        permissions: [],
        sessionId: 'sess-1',
        isEmailVerified: true,
        isCampusIdVerified: true,
      };

      await expect(
        controller.getEventAnalytics('event-owned-by-someone-else', user, {}),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── d. Correct delegation: GET /api/analytics/admin/overview ───────────────

  describe('GET /api/analytics/admin/overview', () => {
    it('delegates to analyticsService.getAdminOverview', async () => {
      const module = await buildModule();
      const controller = module.get<AnalyticsController>(AnalyticsController);

      const expected: AdminOverviewDto = {
        totalEvents: 10,
        totalUsers: 50,
        totalRegistrations: 100,
        totalAttendance: 80,
      };
      mockAnalyticsService.getAdminOverview.mockResolvedValue(expected);

      const result = await controller.getAdminOverview({}, undefined);

      expect(mockAnalyticsService.getAdminOverview).toHaveBeenCalledWith({}, false);
      expect(result).toEqual(expected);
    });

    it('passes refresh=true when query param is "true"', async () => {
      const module = await buildModule();
      const controller = module.get<AnalyticsController>(AnalyticsController);

      mockAnalyticsService.getAdminOverview.mockResolvedValue({
        totalEvents: 1,
        totalUsers: 1,
        totalRegistrations: 1,
        totalAttendance: 1,
      });

      await controller.getAdminOverview({}, 'true');

      expect(mockAnalyticsService.getAdminOverview).toHaveBeenCalledWith({}, true);
    });
  });

  // ── e. Correct delegation: GET /api/analytics/events/:eventId ──────────────

  describe('GET /api/analytics/events/:eventId', () => {
    it('delegates to analyticsService.getEventAnalytics', async () => {
      const module = await buildModule();
      const controller = module.get<AnalyticsController>(AnalyticsController);

      const expected: EventAnalyticsDto = {
        eventId: 'evt-1',
        title: 'Test Event',
        totalRegistrations: 20,
        confirmedRegistrations: 15,
        cancelledRegistrations: 5,
        attendanceCount: 12,
        attendanceRate: 80,
      };
      mockAnalyticsService.getEventAnalytics.mockResolvedValue(expected);

      const user = {
        id: 'organizer-1',
        email: 'org@test.com',
        fullName: 'Organizer',
        role: 'Organizer',
        permissions: [],
        sessionId: 'sess-2',
        isEmailVerified: true,
        isCampusIdVerified: true,
      };

      const result = await controller.getEventAnalytics('evt-1', user, {});

      expect(mockAnalyticsService.getEventAnalytics).toHaveBeenCalledWith(
        'evt-1',
        'organizer-1',
        {},
      );
      expect(result).toEqual(expected);
    });
  });
});
