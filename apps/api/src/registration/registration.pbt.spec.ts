import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WaitlistService } from './waitlist.service';
import { AnalyticsService } from '../analytics/analytics.service';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const PENDING_ID = 'status-pending';
const CONFIRMED_ID = 'status-confirmed';
const CANCELLED_ID = 'status-cancelled';

function buildMockPrisma(): Record<string, unknown> & {
  registrationStatus: { findFirst: jest.Mock };
  $transaction: jest.Mock;
} {
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

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Property 1: Registration status matches event approval setting ───────────
// Feature: event-registration, Property 1: Registration status matches event approval setting

/**
 * Validates: Requirements 1.1, 1.2
 *
 * For any event and student, when the student registers for an event that has
 * available capacity, the resulting registration status is CONFIRMED if
 * `requiresApproval` is false, and PENDING if `requiresApproval` is true.
 */
describe('Property 1 — Registration status matches event approval setting', () => {
  it('status is CONFIRMED when requiresApproval=false, PENDING when requiresApproval=true', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(), // requiresApproval
        fc.uuid(), // userId
        fc.uuid(), // eventId
        fc.integer({ min: 1, max: 100 }), // capacity (always > 0 so spot is available)
        async (requiresApproval, userId, eventId, capacity) => {
          const mockPrisma = buildMockPrisma();

          // Mock $transaction to execute the callback directly with a tx client
          mockPrisma.$transaction.mockImplementation(
            async (callback: (tx: unknown) => Promise<unknown>) => {
              const tx = {
                event: {
                  findUnique: jest.fn().mockResolvedValue({
                    id: eventId,
                    capacity,
                    requiresApproval,
                  }),
                },
                registration: {
                  findFirst: jest.fn().mockResolvedValue(null), // no duplicate
                  count: jest.fn().mockResolvedValue(0), // 0 confirmed → spot available
                  create: jest
                    .fn()
                    .mockImplementation(
                      (args: { data: { userId: string; eventId: string; statusId: string } }) =>
                        Promise.resolve({
                          id: 'reg-1',
                          userId: args.data.userId,
                          eventId: args.data.eventId,
                          statusId: args.data.statusId,
                          registrationDate: new Date(),
                          deletedAt: null,
                        }),
                    ),
                },
              };
              return callback(tx);
            },
          );

          const service = await buildService(mockPrisma);
          const result = await service.register({ userId, eventId });

          expect(result.kind).toBe('registered');
          if (result.kind === 'registered') {
            const expectedStatusId = requiresApproval ? PENDING_ID : CONFIRMED_ID;
            expect(result.registration.statusId).toBe(expectedStatusId);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 2: Duplicate registration is rejected ──────────────────────────
// Feature: event-registration, Property 2: Duplicate registration is rejected

/**
 * Validates: Requirements 1.3
 *
 * For any student and event, if the student already has an active registration
 * (PENDING or CONFIRMED), a second registration attempt returns a conflict error
 * and the total number of registrations for that student+event pair remains unchanged.
 */
describe('Property 2 — Duplicate registration is rejected', () => {
  it('throws ConflictException and does not call prisma.registration.create when an active registration exists', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.uuid(), // eventId
        fc.constantFrom(PENDING_ID, CONFIRMED_ID), // existing active status
        async (userId, eventId, existingStatusId) => {
          const mockPrisma = buildMockPrisma();

          const registrationCreate = jest.fn();

          mockPrisma.$transaction.mockImplementation(
            async (callback: (tx: unknown) => Promise<unknown>) => {
              const tx = {
                event: {
                  findUnique: jest.fn().mockResolvedValue({
                    id: eventId,
                    capacity: 10,
                    requiresApproval: false,
                  }),
                },
                registration: {
                  findFirst: jest.fn().mockResolvedValue({
                    id: 'existing-reg',
                    userId,
                    eventId,
                    statusId: existingStatusId,
                    registrationDate: new Date(),
                    deletedAt: null,
                  }),
                  count: jest.fn().mockResolvedValue(0),
                  create: registrationCreate,
                },
              };
              return callback(tx);
            },
          );

          const service = await buildService(mockPrisma);

          await expect(service.register({ userId, eventId })).rejects.toThrow(ConflictException);

          expect(registrationCreate).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 8: Organizer approval updates status and sends notification ─────
// Feature: event-registration, Property 8: Organizer approval updates status and sends notification

/**
 * Validates: Requirements 4.1, 4.6
 *
 * For any PENDING registration on an event with available capacity, when an
 * organizer approves it, the registration status becomes CONFIRMED and a
 * notification of type REGISTRATION_APPROVED is enqueued for the student.
 */
describe('Property 8 — Organizer approval updates status and sends notification', () => {
  it('sets status to CONFIRMED and enqueues REGISTRATION_APPROVED notification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // registrationId
        fc.uuid(), // organizerId (also the event creator)
        fc.uuid(), // studentId
        fc.uuid(), // eventId
        fc.integer({ min: 1, max: 100 }), // capacity
        async (registrationId, organizerId, studentId, eventId, capacity) => {
          const mockPrisma = buildMockPrisma();

          // approveByOrganizer uses this.prisma directly (not $transaction)
          // Step 1: findUnique for the registration (includes status + event)
          mockPrisma.registration = {
            findUnique: jest.fn().mockResolvedValue({
              id: registrationId,
              userId: studentId,
              eventId,
              statusId: PENDING_ID,
              status: { name: 'PENDING' },
              event: { id: eventId, capacity },
              registrationDate: new Date(),
              deletedAt: null,
            }),
            count: jest.fn().mockResolvedValue(0), // 0 confirmed → under capacity
            update: jest.fn().mockImplementation((args: { data: { statusId: string } }) =>
              Promise.resolve({
                id: registrationId,
                userId: studentId,
                eventId,
                statusId: args.data.statusId,
                registrationDate: new Date(),
                deletedAt: null,
              }),
            ),
          };

          // assertOrganizer calls event.findUnique — organizerId is the creator
          mockPrisma.event = {
            findUnique: jest.fn().mockResolvedValue({
              id: eventId,
              createdBy: organizerId,
              organizers: [],
            }),
          };

          const service = await buildService(mockPrisma);
          const result = await service.approveByOrganizer({ registrationId, organizerId });

          expect(result.statusId).toBe(CONFIRMED_ID);
          expect(mockNotifications.enqueueNotification).toHaveBeenCalledWith(
            studentId,
            expect.any(String),
            expect.any(String),
            'REGISTRATION_APPROVED',
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 9: Organizer rejection cancels registration and sends notification
// Feature: event-registration, Property 9: Organizer rejection cancels registration and sends notification

/**
 * Validates: Requirements 4.3
 *
 * For any PENDING registration, when an organizer rejects it, the registration
 * status becomes CANCELLED and a notification of type REGISTRATION_REJECTED is
 * enqueued for the student.
 */
describe('Property 9 — Organizer rejection cancels registration and sends notification', () => {
  it('sets status to CANCELLED and enqueues REGISTRATION_REJECTED notification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // registrationId
        fc.uuid(), // organizerId (also the event creator)
        fc.uuid(), // studentId
        fc.uuid(), // eventId
        async (registrationId, organizerId, studentId, eventId) => {
          const mockPrisma = buildMockPrisma();

          // rejectByOrganizer uses this.prisma directly (not $transaction)
          mockPrisma.registration = {
            findUnique: jest.fn().mockResolvedValue({
              id: registrationId,
              userId: studentId,
              eventId,
              statusId: PENDING_ID,
              status: { name: 'PENDING' },
              registrationDate: new Date(),
              deletedAt: null,
            }),
            update: jest.fn().mockImplementation((args: { data: { statusId: string } }) =>
              Promise.resolve({
                id: registrationId,
                userId: studentId,
                eventId,
                statusId: args.data.statusId,
                registrationDate: new Date(),
                deletedAt: null,
              }),
            ),
          };

          // assertOrganizer — organizerId is the creator
          mockPrisma.event = {
            findUnique: jest.fn().mockResolvedValue({
              id: eventId,
              createdBy: organizerId,
              organizers: [],
            }),
          };

          const service = await buildService(mockPrisma);
          const result = await service.rejectByOrganizer({ registrationId, organizerId });

          expect(result.statusId).toBe(CANCELLED_ID);
          expect(mockNotifications.enqueueNotification).toHaveBeenCalledWith(
            studentId,
            expect.any(String),
            expect.any(String),
            'REGISTRATION_REJECTED',
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 10: Organizer removal cancels registration and triggers promotion
// Feature: event-registration, Property 10: Organizer removal cancels registration and triggers promotion

/**
 * Validates: Requirements 4.4
 *
 * For any CONFIRMED registration, when an organizer removes it, the registration
 * status becomes CANCELLED, a notification of type REGISTRATION_REMOVED is
 * enqueued for the student, and promoteNext is called.
 */
describe('Property 10 — Organizer removal cancels registration and triggers promotion', () => {
  it('sets status to CANCELLED, enqueues REGISTRATION_REMOVED notification, and calls promoteNext', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // registrationId
        fc.uuid(), // organizerId (also the event creator)
        fc.uuid(), // studentId
        fc.uuid(), // eventId
        async (registrationId, organizerId, studentId, eventId) => {
          const mockPrisma = buildMockPrisma();

          // removeByOrganizer uses $transaction
          mockPrisma.$transaction.mockImplementation(
            async (callback: (tx: unknown) => Promise<unknown>) => {
              const tx = {
                registration: {
                  findUnique: jest.fn().mockResolvedValue({
                    id: registrationId,
                    userId: studentId,
                    eventId,
                    statusId: CONFIRMED_ID,
                    status: { name: 'CONFIRMED' },
                    registrationDate: new Date(),
                    deletedAt: null,
                  }),
                  update: jest.fn().mockImplementation((args: { data: { statusId: string } }) =>
                    Promise.resolve({
                      id: registrationId,
                      userId: studentId,
                      eventId,
                      statusId: args.data.statusId,
                      registrationDate: new Date(),
                      deletedAt: null,
                    }),
                  ),
                },
              };
              return callback(tx);
            },
          );

          // assertOrganizer (called inside the transaction callback via this.prisma) — organizerId is the creator
          mockPrisma.event = {
            findUnique: jest.fn().mockResolvedValue({
              id: eventId,
              createdBy: organizerId,
              organizers: [],
            }),
          };

          const service = await buildService(mockPrisma);
          const result = await service.removeByOrganizer({ registrationId, organizerId });

          expect(result.statusId).toBe(CANCELLED_ID);
          expect(mockNotifications.enqueueNotification).toHaveBeenCalledWith(
            studentId,
            expect.any(String),
            expect.any(String),
            'REGISTRATION_REMOVED',
          );
          expect(mockWaitlist.promoteNext).toHaveBeenCalledWith(eventId, expect.anything());
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 11: Non-organizer actions are forbidden ────────────────────────
// Feature: event-registration, Property 11: Non-organizer actions are forbidden

/**
 * Validates: Requirements 4.5
 *
 * For any user who is not the event creator or an accepted organizer, attempting
 * to approve, reject, or remove a registration returns a ForbiddenException.
 */
describe('Property 11 — Non-organizer actions are forbidden', () => {
  it('throws ForbiddenException for approve/reject/remove when user is not an organizer', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // registrationId
        fc.uuid(), // nonOrganizerId
        fc.uuid(), // studentId
        fc.uuid(), // eventId
        fc.uuid(), // actual event creator (different from nonOrganizerId)
        async (registrationId, nonOrganizerId, studentId, eventId, creatorId) => {
          // Ensure nonOrganizerId is never the creator
          fc.pre(nonOrganizerId !== creatorId);

          const mockPrisma = buildMockPrisma();

          // Shared registration mock for approve/reject (direct prisma calls)
          const registrationFindUnique = jest.fn().mockResolvedValue({
            id: registrationId,
            userId: studentId,
            eventId,
            statusId: PENDING_ID,
            status: { name: 'PENDING' },
            event: { id: eventId, capacity: 10 },
            registrationDate: new Date(),
            deletedAt: null,
          });

          mockPrisma.registration = {
            findUnique: registrationFindUnique,
            count: jest.fn().mockResolvedValue(0),
            update: jest.fn(),
          };

          // assertOrganizer: nonOrganizerId is NOT the creator and has no accepted organizer entry
          mockPrisma.event = {
            findUnique: jest.fn().mockResolvedValue({
              id: eventId,
              createdBy: creatorId,
              organizers: [], // no accepted organizer entries for nonOrganizerId
            }),
          };

          // removeByOrganizer uses $transaction — mock it to run the callback
          mockPrisma.$transaction.mockImplementation(
            async (callback: (tx: unknown) => Promise<unknown>) => {
              const tx = {
                registration: {
                  findUnique: jest.fn().mockResolvedValue({
                    id: registrationId,
                    userId: studentId,
                    eventId,
                    statusId: CONFIRMED_ID,
                    status: { name: 'CONFIRMED' },
                    registrationDate: new Date(),
                    deletedAt: null,
                  }),
                  update: jest.fn(),
                },
              };
              return callback(tx);
            },
          );

          const service = await buildService(mockPrisma);

          await expect(
            service.approveByOrganizer({ registrationId, organizerId: nonOrganizerId }),
          ).rejects.toThrow(ForbiddenException);

          await expect(
            service.rejectByOrganizer({ registrationId, organizerId: nonOrganizerId }),
          ).rejects.toThrow(ForbiddenException);

          await expect(
            service.removeByOrganizer({ registrationId, organizerId: nonOrganizerId }),
          ).rejects.toThrow(ForbiddenException);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 12: Student self-cancellation updates status and triggers promotion
// Feature: event-registration, Property 12: Student self-cancellation updates status and triggers promotion

/**
 * Validates: Requirements 5.1
 *
 * For any student cancelling their own CONFIRMED or PENDING registration, the
 * status becomes CANCELLED, and if the cancelled status was CONFIRMED, the next
 * waitlisted student (if any) is promoted.
 */
describe('Property 12 — Student self-cancellation updates status and triggers promotion', () => {
  it('sets status to CANCELLED; calls promoteNext only when the cancelled registration was CONFIRMED', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // registrationId
        fc.uuid(), // studentId
        fc.uuid(), // eventId
        fc.constantFrom('CONFIRMED', 'PENDING'), // initial status
        async (registrationId, studentId, eventId, initialStatus) => {
          mockWaitlist.promoteNext.mockClear();
          const mockPrisma = buildMockPrisma();

          const initialStatusId = initialStatus === 'CONFIRMED' ? CONFIRMED_ID : PENDING_ID;

          // cancelByStudent uses $transaction
          mockPrisma.$transaction.mockImplementation(
            async (callback: (tx: unknown) => Promise<unknown>) => {
              const tx = {
                registration: {
                  findUnique: jest.fn().mockResolvedValue({
                    id: registrationId,
                    userId: studentId,
                    eventId,
                    statusId: initialStatusId,
                    status: { name: initialStatus },
                    registrationDate: new Date(),
                    deletedAt: null,
                  }),
                  update: jest.fn().mockImplementation((args: { data: { statusId: string } }) =>
                    Promise.resolve({
                      id: registrationId,
                      userId: studentId,
                      eventId,
                      statusId: args.data.statusId,
                      registrationDate: new Date(),
                      deletedAt: null,
                    }),
                  ),
                },
              };
              return callback(tx);
            },
          );

          const service = await buildService(mockPrisma);
          const result = await service.cancelByStudent(registrationId, studentId);

          // Status must always become CANCELLED
          expect(result.statusId).toBe(CANCELLED_ID);

          if (initialStatus === 'CONFIRMED') {
            // Promotion must be triggered for CONFIRMED cancellations
            expect(mockWaitlist.promoteNext).toHaveBeenCalledWith(eventId, expect.anything());
          } else {
            // No promotion for PENDING cancellations
            expect(mockWaitlist.promoteNext).not.toHaveBeenCalled();
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 13: Cross-user cancellation is forbidden ───────────────────────
// Feature: event-registration, Property 13: Cross-user cancellation is forbidden

/**
 * Validates: Requirements 5.2
 *
 * For any student attempting to cancel a registration belonging to a different
 * student, a ForbiddenException is returned.
 */
describe('Property 13 — Cross-user cancellation is forbidden', () => {
  it('throws ForbiddenException when the requesting student does not own the registration', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // registrationId
        fc.uuid(), // studentId (the requester)
        fc.uuid(), // differentOwnerId (the actual owner)
        fc.uuid(), // eventId
        async (registrationId, studentId, differentOwnerId, eventId) => {
          // Ensure the requester is never the owner
          fc.pre(studentId !== differentOwnerId);

          const mockPrisma = buildMockPrisma();

          // cancelByStudent uses $transaction
          mockPrisma.$transaction.mockImplementation(
            async (callback: (tx: unknown) => Promise<unknown>) => {
              const tx = {
                registration: {
                  findUnique: jest.fn().mockResolvedValue({
                    id: registrationId,
                    userId: differentOwnerId, // owned by a different user
                    eventId,
                    statusId: CONFIRMED_ID,
                    status: { name: 'CONFIRMED' },
                    registrationDate: new Date(),
                    deletedAt: null,
                  }),
                  update: jest.fn(),
                },
              };
              return callback(tx);
            },
          );

          const service = await buildService(mockPrisma);

          await expect(service.cancelByStudent(registrationId, studentId)).rejects.toThrow(
            ForbiddenException,
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
