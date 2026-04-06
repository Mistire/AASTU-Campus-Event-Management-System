import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WaitlistService } from './waitlist.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';

// ─── Status ID constants ──────────────────────────────────────────────────────

const PENDING_ID = 'status-pending';
const CONFIRMED_ID = 'status-confirmed';
const CANCELLED_ID = 'status-cancelled';

// ─── Mock factories ───────────────────────────────────────────────────────────

function buildMockPrisma() {
  return {
    registrationStatus: {
      findFirst: jest.fn((args: { where: { name: string } }) => {
        const map: Record<string, string> = {
          PENDING: PENDING_ID,
          CONFIRMED: CONFIRMED_ID,
          CANCELLED: CANCELLED_ID,
        };
        const id = map[args.where.name];
        return Promise.resolve(id ? { id } : null);
      }),
    },
    registration: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    event: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };
}

const mockNotifications = {
  enqueueNotification: jest.fn().mockResolvedValue(undefined),
};

const mockWaitlist = {
  addToWaitlist: jest.fn(),
  promoteNext: jest.fn().mockResolvedValue(null),
};

const mockAnalytics = {
  invalidateEventCache: jest.fn().mockResolvedValue(undefined),
};

// ─── Helper: build service ────────────────────────────────────────────────────

async function buildService(
  mockPrisma: ReturnType<typeof buildMockPrisma>,
): Promise<RegistrationService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      RegistrationService,
      { provide: PrismaService, useValue: mockPrisma },
      { provide: NotificationsService, useValue: mockNotifications },
      { provide: WaitlistService, useValue: mockWaitlist },
      { provide: AnalyticsService, useValue: mockAnalytics },
    ],
  }).compile();
  return module.get(RegistrationService);
}

// ─── Shared test data ─────────────────────────────────────────────────────────

const USER_ID = 'user-abc';
const EVENT_ID = 'event-xyz';
const REG_ID = 'reg-001';
const ORGANIZER_ID = 'organizer-001';

function makeRegistration(overrides: Record<string, unknown> = {}) {
  return {
    id: REG_ID,
    userId: USER_ID,
    eventId: EVENT_ID,
    statusId: CONFIRMED_ID,
    registrationDate: new Date(),
    deletedAt: null,
    status: { id: CONFIRMED_ID, name: 'CONFIRMED' },
    event: { id: EVENT_ID, capacity: 10, requiresApproval: false },
    ...overrides,
  };
}

function makeEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: EVENT_ID,
    capacity: 10,
    requiresApproval: false,
    createdBy: ORGANIZER_ID,
    organizers: [],
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

afterEach(() => {
  jest.clearAllMocks();
});

// ─── register() ──────────────────────────────────────────────────────────────

describe('RegistrationService.register()', () => {
  /**
   * Requirement 1.1 — auto-confirm when requiresApproval=false and capacity available
   */
  it('creates a CONFIRMED registration when requiresApproval=false and capacity available', async () => {
    const mockPrisma = buildMockPrisma();

    mockPrisma.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          event: {
            findUnique: jest.fn().mockResolvedValue(makeEvent({ requiresApproval: false })),
          },
          registration: {
            findFirst: jest.fn().mockResolvedValue(null),
            count: jest.fn().mockResolvedValue(0),
            create: jest.fn().mockResolvedValue(makeRegistration({ statusId: CONFIRMED_ID })),
          },
        };
        return callback(tx);
      },
    );

    const service = await buildService(mockPrisma);
    const result = await service.register({ userId: USER_ID, eventId: EVENT_ID });

    expect(result.kind).toBe('registered');
    if (result.kind === 'registered') {
      expect(result.registration.statusId).toBe(CONFIRMED_ID);
    }
  });

  /**
   * Requirement 1.2 — pending when requiresApproval=true and capacity available
   */
  it('creates a PENDING registration when requiresApproval=true and capacity available', async () => {
    const mockPrisma = buildMockPrisma();

    mockPrisma.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          event: {
            findUnique: jest.fn().mockResolvedValue(makeEvent({ requiresApproval: true })),
          },
          registration: {
            findFirst: jest.fn().mockResolvedValue(null),
            count: jest.fn().mockResolvedValue(0),
            create: jest.fn().mockResolvedValue(makeRegistration({ statusId: PENDING_ID })),
          },
        };
        return callback(tx);
      },
    );

    const service = await buildService(mockPrisma);
    const result = await service.register({ userId: USER_ID, eventId: EVENT_ID });

    expect(result.kind).toBe('registered');
    if (result.kind === 'registered') {
      expect(result.registration.statusId).toBe(PENDING_ID);
    }
  });

  /**
   * Requirement 1.4 — event not found → NotFoundException
   */
  it('throws NotFoundException when event does not exist', async () => {
    const mockPrisma = buildMockPrisma();

    mockPrisma.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          event: { findUnique: jest.fn().mockResolvedValue(null) },
          registration: { findFirst: jest.fn(), count: jest.fn(), create: jest.fn() },
        };
        return callback(tx);
      },
    );

    const service = await buildService(mockPrisma);
    await expect(service.register({ userId: USER_ID, eventId: 'bad-id' })).rejects.toThrow(
      NotFoundException,
    );
  });

  /**
   * Requirement 1.3 — duplicate active registration → ConflictException
   */
  it('throws ConflictException when student already has an active registration', async () => {
    const mockPrisma = buildMockPrisma();

    mockPrisma.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          event: {
            findUnique: jest.fn().mockResolvedValue(makeEvent()),
          },
          registration: {
            findFirst: jest.fn().mockResolvedValue(makeRegistration()),
            count: jest.fn().mockResolvedValue(1),
            create: jest.fn(),
          },
        };
        return callback(tx);
      },
    );

    const service = await buildService(mockPrisma);
    await expect(service.register({ userId: USER_ID, eventId: EVENT_ID })).rejects.toThrow(
      ConflictException,
    );
  });

  /**
   * Requirement 2.1 — event at capacity → routes to waitlist (calls addToWaitlist)
   */
  it('calls addToWaitlist when event is at capacity', async () => {
    const mockPrisma = buildMockPrisma();
    const waitlistEntry = {
      id: 'wl-1',
      userId: USER_ID,
      eventId: EVENT_ID,
      position: 1,
      joinedAt: new Date(),
    };
    mockWaitlist.addToWaitlist.mockResolvedValue(waitlistEntry);

    mockPrisma.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          event: {
            findUnique: jest.fn().mockResolvedValue(makeEvent({ capacity: 5 })),
          },
          registration: {
            findFirst: jest.fn().mockResolvedValue(null),
            count: jest.fn().mockResolvedValue(5), // at capacity
            create: jest.fn(),
          },
        };
        return callback(tx);
      },
    );

    const service = await buildService(mockPrisma);
    const result = await service.register({ userId: USER_ID, eventId: EVENT_ID });

    expect(result.kind).toBe('waitlisted');
    expect(mockWaitlist.addToWaitlist).toHaveBeenCalled();
  });
});

// ─── cancelByStudent() ────────────────────────────────────────────────────────

describe('RegistrationService.cancelByStudent()', () => {
  /**
   * Requirement 5.1 — happy path: status → CANCELLED, promoteNext called if was CONFIRMED
   */
  it('cancels a CONFIRMED registration and calls promoteNext', async () => {
    const mockPrisma = buildMockPrisma();
    const reg = makeRegistration({ status: { id: CONFIRMED_ID, name: 'CONFIRMED' } });
    const cancelled = { ...reg, statusId: CANCELLED_ID };

    mockPrisma.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          registration: {
            findUnique: jest.fn().mockResolvedValue(reg),
            update: jest.fn().mockResolvedValue(cancelled),
          },
        };
        return callback(tx);
      },
    );

    const service = await buildService(mockPrisma);
    const result = await service.cancelByStudent(REG_ID, USER_ID);

    expect(result.statusId).toBe(CANCELLED_ID);
    expect(mockWaitlist.promoteNext).toHaveBeenCalledWith(EVENT_ID, expect.anything());
  });

  /**
   * Requirement 5.1 — cancelling a PENDING registration does NOT call promoteNext
   */
  it('cancels a PENDING registration without calling promoteNext', async () => {
    const mockPrisma = buildMockPrisma();
    const reg = makeRegistration({
      statusId: PENDING_ID,
      status: { id: PENDING_ID, name: 'PENDING' },
    });
    const cancelled = { ...reg, statusId: CANCELLED_ID };

    mockPrisma.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          registration: {
            findUnique: jest.fn().mockResolvedValue(reg),
            update: jest.fn().mockResolvedValue(cancelled),
          },
        };
        return callback(tx);
      },
    );

    const service = await buildService(mockPrisma);
    await service.cancelByStudent(REG_ID, USER_ID);

    expect(mockWaitlist.promoteNext).not.toHaveBeenCalled();
  });

  /**
   * Requirement 5.2 — cross-user cancel → ForbiddenException
   */
  it("throws ForbiddenException when student tries to cancel another student's registration", async () => {
    const mockPrisma = buildMockPrisma();
    const reg = makeRegistration({ userId: 'other-user' });

    mockPrisma.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          registration: {
            findUnique: jest.fn().mockResolvedValue(reg),
            update: jest.fn(),
          },
        };
        return callback(tx);
      },
    );

    const service = await buildService(mockPrisma);
    await expect(service.cancelByStudent(REG_ID, USER_ID)).rejects.toThrow(ForbiddenException);
  });

  /**
   * Requirement 5.3 — cancel already-cancelled → ConflictException
   */
  it('throws ConflictException when registration is already cancelled', async () => {
    const mockPrisma = buildMockPrisma();
    const reg = makeRegistration({
      statusId: CANCELLED_ID,
      status: { id: CANCELLED_ID, name: 'CANCELLED' },
    });

    mockPrisma.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          registration: {
            findUnique: jest.fn().mockResolvedValue(reg),
            update: jest.fn(),
          },
        };
        return callback(tx);
      },
    );

    const service = await buildService(mockPrisma);
    await expect(service.cancelByStudent(REG_ID, USER_ID)).rejects.toThrow(ConflictException);
  });
});

// ─── approveByOrganizer() ─────────────────────────────────────────────────────

describe('RegistrationService.approveByOrganizer()', () => {
  /**
   * Requirement 4.1, 4.6 — happy path: status → CONFIRMED, REGISTRATION_APPROVED notification
   */
  it('approves a PENDING registration and sends REGISTRATION_APPROVED notification', async () => {
    const mockPrisma = buildMockPrisma();
    const reg = makeRegistration({
      statusId: PENDING_ID,
      status: { id: PENDING_ID, name: 'PENDING' },
    });
    const approved = { ...reg, statusId: CONFIRMED_ID };

    mockPrisma.registration.findUnique.mockResolvedValue(reg);
    mockPrisma.event.findUnique.mockResolvedValue(makeEvent({ createdBy: ORGANIZER_ID }));
    mockPrisma.registration.count.mockResolvedValue(3); // below capacity of 10
    mockPrisma.registration.update.mockResolvedValue(approved);

    const service = await buildService(mockPrisma);
    const result = await service.approveByOrganizer({
      registrationId: REG_ID,
      organizerId: ORGANIZER_ID,
    });

    expect(result.statusId).toBe(CONFIRMED_ID);
    expect(mockNotifications.enqueueNotification).toHaveBeenCalledWith(
      USER_ID,
      expect.any(String),
      expect.any(String),
      NotificationType.REGISTRATION_APPROVED,
    );
  });

  /**
   * Requirement 4.2 — approve at capacity → ConflictException
   */
  it('throws ConflictException when event is already at capacity', async () => {
    const mockPrisma = buildMockPrisma();
    const reg = makeRegistration({
      statusId: PENDING_ID,
      status: { id: PENDING_ID, name: 'PENDING' },
      event: { id: EVENT_ID, capacity: 5, requiresApproval: false },
    });

    mockPrisma.registration.findUnique.mockResolvedValue(reg);
    mockPrisma.event.findUnique.mockResolvedValue(
      makeEvent({ createdBy: ORGANIZER_ID, capacity: 5 }),
    );
    mockPrisma.registration.count.mockResolvedValue(5); // at capacity

    const service = await buildService(mockPrisma);
    await expect(
      service.approveByOrganizer({ registrationId: REG_ID, organizerId: ORGANIZER_ID }),
    ).rejects.toThrow(ConflictException);

    expect(mockPrisma.registration.update).not.toHaveBeenCalled();
  });

  /**
   * Requirement 4.5 — non-organizer → ForbiddenException
   */
  it('throws ForbiddenException when caller is not an organizer', async () => {
    const mockPrisma = buildMockPrisma();
    const reg = makeRegistration({
      statusId: PENDING_ID,
      status: { id: PENDING_ID, name: 'PENDING' },
    });

    mockPrisma.registration.findUnique.mockResolvedValue(reg);
    // Event has a different creator and no organizers for this user
    mockPrisma.event.findUnique.mockResolvedValue(
      makeEvent({ createdBy: 'someone-else', organizers: [] }),
    );

    const service = await buildService(mockPrisma);
    await expect(
      service.approveByOrganizer({ registrationId: REG_ID, organizerId: 'not-organizer' }),
    ).rejects.toThrow(ForbiddenException);
  });
});

// ─── rejectByOrganizer() ──────────────────────────────────────────────────────

describe('RegistrationService.rejectByOrganizer()', () => {
  /**
   * Requirement 4.3 — happy path: status → CANCELLED, REGISTRATION_REJECTED notification
   */
  it('rejects a PENDING registration and sends REGISTRATION_REJECTED notification', async () => {
    const mockPrisma = buildMockPrisma();
    const reg = makeRegistration({
      statusId: PENDING_ID,
      status: { id: PENDING_ID, name: 'PENDING' },
    });
    const rejected = { ...reg, statusId: CANCELLED_ID };

    mockPrisma.registration.findUnique.mockResolvedValue(reg);
    mockPrisma.event.findUnique.mockResolvedValue(makeEvent({ createdBy: ORGANIZER_ID }));
    mockPrisma.registration.update.mockResolvedValue(rejected);

    const service = await buildService(mockPrisma);
    const result = await service.rejectByOrganizer({
      registrationId: REG_ID,
      organizerId: ORGANIZER_ID,
    });

    expect(result.statusId).toBe(CANCELLED_ID);
    expect(mockNotifications.enqueueNotification).toHaveBeenCalledWith(
      USER_ID,
      expect.any(String),
      expect.any(String),
      NotificationType.REGISTRATION_REJECTED,
    );
  });

  /**
   * Requirement 4.5 — non-organizer → ForbiddenException
   */
  it('throws ForbiddenException when caller is not an organizer', async () => {
    const mockPrisma = buildMockPrisma();
    const reg = makeRegistration({
      statusId: PENDING_ID,
      status: { id: PENDING_ID, name: 'PENDING' },
    });

    mockPrisma.registration.findUnique.mockResolvedValue(reg);
    mockPrisma.event.findUnique.mockResolvedValue(
      makeEvent({ createdBy: 'someone-else', organizers: [] }),
    );

    const service = await buildService(mockPrisma);
    await expect(
      service.rejectByOrganizer({ registrationId: REG_ID, organizerId: 'not-organizer' }),
    ).rejects.toThrow(ForbiddenException);
  });
});

// ─── removeByOrganizer() ──────────────────────────────────────────────────────

describe('RegistrationService.removeByOrganizer()', () => {
  /**
   * Requirement 4.4 — happy path: status → CANCELLED, REGISTRATION_REMOVED notification, promoteNext called
   */
  it('removes a CONFIRMED registration, sends REGISTRATION_REMOVED notification, and calls promoteNext', async () => {
    const mockPrisma = buildMockPrisma();
    const reg = makeRegistration({ status: { id: CONFIRMED_ID, name: 'CONFIRMED' } });
    const removed = { ...reg, statusId: CANCELLED_ID };

    mockPrisma.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          registration: {
            findUnique: jest.fn().mockResolvedValue(reg),
            update: jest.fn().mockResolvedValue(removed),
          },
        };
        return callback(tx);
      },
    );
    // assertOrganizer uses this.prisma (not tx)
    mockPrisma.event.findUnique.mockResolvedValue(makeEvent({ createdBy: ORGANIZER_ID }));

    const service = await buildService(mockPrisma);
    const result = await service.removeByOrganizer({
      registrationId: REG_ID,
      organizerId: ORGANIZER_ID,
    });

    expect(result.statusId).toBe(CANCELLED_ID);
    expect(mockNotifications.enqueueNotification).toHaveBeenCalledWith(
      USER_ID,
      expect.any(String),
      expect.any(String),
      NotificationType.REGISTRATION_REMOVED,
    );
    expect(mockWaitlist.promoteNext).toHaveBeenCalledWith(EVENT_ID, expect.anything());
  });

  /**
   * Requirement 4.5 — non-organizer → ForbiddenException
   */
  it('throws ForbiddenException when caller is not an organizer', async () => {
    const mockPrisma = buildMockPrisma();
    const reg = makeRegistration({ status: { id: CONFIRMED_ID, name: 'CONFIRMED' } });

    mockPrisma.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          registration: {
            findUnique: jest.fn().mockResolvedValue(reg),
            update: jest.fn(),
          },
        };
        return callback(tx);
      },
    );
    mockPrisma.event.findUnique.mockResolvedValue(
      makeEvent({ createdBy: 'someone-else', organizers: [] }),
    );

    const service = await buildService(mockPrisma);
    await expect(
      service.removeByOrganizer({ registrationId: REG_ID, organizerId: 'not-organizer' }),
    ).rejects.toThrow(ForbiddenException);
  });
});
