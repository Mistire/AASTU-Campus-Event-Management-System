import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { JwtAuthGuard } from '../auth/guard';
import type { AuthUser } from '../auth/jwt.strategy';
import { CreateRegistrationDto } from './dto/create-registration.dto';

// ─── Mock RegistrationService ─────────────────────────────────────────────────

const mockRegistrationService = {
  register: jest.fn(),
  cancelByStudent: jest.fn(),
  approveByOrganizer: jest.fn(),
  rejectByOrganizer: jest.fn(),
  removeByOrganizer: jest.fn(),
};

// ─── Guard factories ──────────────────────────────────────────────────────────

const rejectingJwtGuard = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate: (_ctx: ExecutionContext) => {
    throw new UnauthorizedException();
  },
};

const allowingGuard = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate: (_ctx: ExecutionContext) => true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function buildModule(jwtGuard: object = allowingGuard): Promise<TestingModule> {
  return Test.createTestingModule({
    controllers: [RegistrationController],
    providers: [{ provide: RegistrationService, useValue: mockRegistrationService }],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(jwtGuard)
    .compile();
}

const mockUser: AuthUser = {
  id: 'user-uuid-1',
  email: 'student@test.com',
  fullName: 'Test Student',
  role: 'Student',
  permissions: [],
  sessionId: 'session-uuid-1',
  isEmailVerified: true,
  isCampusIdVerified: true,
};

const REGISTRATION_ID = 'reg-uuid-1';
const EVENT_ID = 'event-uuid-1';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('RegistrationController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── 1. Guard: unauthenticated requests return 401 ─────────────────────────

  describe('401 — unauthenticated requests', () => {
    it('JwtAuthGuard rejects unauthenticated requests with UnauthorizedException', async () => {
      const module = await buildModule(rejectingJwtGuard);
      const guard = module.get(JwtAuthGuard);

      expect(() => guard.canActivate({} as ExecutionContext)).toThrow(UnauthorizedException);
    });
  });

  // ── 2. POST /registrations → register ────────────────────────────────────

  describe('POST /registrations', () => {
    it('delegates to registrationService.register with userId and eventId', async () => {
      const module = await buildModule();
      const controller = module.get<RegistrationController>(RegistrationController);

      const expected = { kind: 'registered', registration: { id: REGISTRATION_ID } };
      mockRegistrationService.register.mockResolvedValue(expected);

      const dto: CreateRegistrationDto = { eventId: EVENT_ID };
      const result = await controller.register(mockUser, dto);

      expect(mockRegistrationService.register).toHaveBeenCalledWith({
        userId: mockUser.id,
        eventId: EVENT_ID,
      });
      expect(result).toEqual(expected);
    });
  });

  // ── 3. DELETE /registrations/:id → cancelByStudent ───────────────────────

  describe('DELETE /registrations/:id', () => {
    it('delegates to registrationService.cancelByStudent with id and user.id', async () => {
      const module = await buildModule();
      const controller = module.get<RegistrationController>(RegistrationController);

      const expected = { id: REGISTRATION_ID, statusId: 'cancelled-status-id' };
      mockRegistrationService.cancelByStudent.mockResolvedValue(expected);

      const result = await controller.cancel(mockUser, REGISTRATION_ID);

      expect(mockRegistrationService.cancelByStudent).toHaveBeenCalledWith(
        REGISTRATION_ID,
        mockUser.id,
      );
      expect(result).toEqual(expected);
    });
  });

  // ── 4. PATCH /registrations/:id/approve → approveByOrganizer ─────────────

  describe('PATCH /registrations/:id/approve', () => {
    it('delegates to registrationService.approveByOrganizer with registrationId and organizerId', async () => {
      const module = await buildModule();
      const controller = module.get<RegistrationController>(RegistrationController);

      const expected = { id: REGISTRATION_ID, statusId: 'confirmed-status-id' };
      mockRegistrationService.approveByOrganizer.mockResolvedValue(expected);

      const result = await controller.approve(mockUser, REGISTRATION_ID);

      expect(mockRegistrationService.approveByOrganizer).toHaveBeenCalledWith({
        registrationId: REGISTRATION_ID,
        organizerId: mockUser.id,
      });
      expect(result).toEqual(expected);
    });
  });

  // ── 5. PATCH /registrations/:id/reject → rejectByOrganizer ───────────────

  describe('PATCH /registrations/:id/reject', () => {
    it('delegates to registrationService.rejectByOrganizer with registrationId and organizerId', async () => {
      const module = await buildModule();
      const controller = module.get<RegistrationController>(RegistrationController);

      const expected = { id: REGISTRATION_ID, statusId: 'cancelled-status-id' };
      mockRegistrationService.rejectByOrganizer.mockResolvedValue(expected);

      const result = await controller.reject(mockUser, REGISTRATION_ID);

      expect(mockRegistrationService.rejectByOrganizer).toHaveBeenCalledWith({
        registrationId: REGISTRATION_ID,
        organizerId: mockUser.id,
      });
      expect(result).toEqual(expected);
    });
  });

  // ── 6. DELETE /registrations/:id/remove → removeByOrganizer ──────────────

  describe('DELETE /registrations/:id/remove', () => {
    it('delegates to registrationService.removeByOrganizer with registrationId and organizerId', async () => {
      const module = await buildModule();
      const controller = module.get<RegistrationController>(RegistrationController);

      const expected = { id: REGISTRATION_ID, statusId: 'cancelled-status-id' };
      mockRegistrationService.removeByOrganizer.mockResolvedValue(expected);

      const result = await controller.remove(mockUser, REGISTRATION_ID);

      expect(mockRegistrationService.removeByOrganizer).toHaveBeenCalledWith({
        registrationId: REGISTRATION_ID,
        organizerId: mockUser.id,
      });
      expect(result).toEqual(expected);
    });
  });
});
