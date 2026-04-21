import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';

// ─── Constants ────────────────────────────────────────────────────────────────

const PENDING_ID = 'status-pending';
const CONFIRMED_ID = 'status-confirmed';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMockPrisma() {
  return {
    $transaction: jest.fn(),
  };
}

function buildMockNotifications() {
  return {
    enqueueNotification: jest.fn().mockResolvedValue(undefined),
  };
}

async function buildService(
  mockPrisma: ReturnType<typeof buildMockPrisma>,
  mockNotifications: ReturnType<typeof buildMockNotifications>,
): Promise<WaitlistService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      WaitlistService,
      { provide: PrismaService, useValue: mockPrisma },
      { provide: NotificationsService, useValue: mockNotifications },
    ],
  }).compile();
  return module.get(WaitlistService);
}

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Property 3: Full event routes to waitlist with sequential positions ──────
// Feature: event-registration, Property 3: Full event routes to waitlist with sequential positions

/**
 * Validates: Requirements 2.1, 2.4
 *
 * For any event at capacity, when N students register sequentially, each
 * receives a waitlist entry with a strictly increasing position number, and
 * no two entries share the same position.
 */
describe('Property 3 — Full event routes to waitlist with sequential positions', () => {
  it('assigns strictly increasing, unique positions to sequential waitlist additions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // eventId
        fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }), // N distinct student IDs
        async (eventId, studentIds) => {
          const mockPrisma = buildMockPrisma();
          const mockNotifications = buildMockNotifications();
          const service = await buildService(mockPrisma, mockNotifications);

          const assignedPositions: number[] = [];

          // Call addToWaitlist for each student sequentially, simulating
          // the aggregate max growing with each insertion.
          for (let i = 0; i < studentIds.length; i++) {
            const currentMax = i; // positions 1..N as i goes 0..N-1

            const tx = {
              eventWaitlist: {
                findFirst: jest.fn().mockResolvedValue(null), // no duplicate
                aggregate: jest.fn().mockResolvedValue({
                  _max: { position: currentMax === 0 ? null : currentMax },
                }),
                create: jest
                  .fn()
                  .mockImplementation(
                    (args: { data: { userId: string; eventId: string; position: number } }) =>
                      Promise.resolve({
                        id: `waitlist-${i}`,
                        userId: args.data.userId,
                        eventId: args.data.eventId,
                        position: args.data.position,
                        joinedAt: new Date(),
                      }),
                  ),
              },
            };

            const entry = await service.addToWaitlist(studentIds[i], eventId, tx as any);
            assignedPositions.push(entry.position);
          }

          // All positions must be strictly increasing
          for (let i = 1; i < assignedPositions.length; i++) {
            expect(assignedPositions[i]).toBeGreaterThan(assignedPositions[i - 1]);
          }

          // No two positions may be the same
          const unique = new Set(assignedPositions);
          expect(unique.size).toBe(assignedPositions.length);

          // Positions must start at 1 and increment by 1
          expect(assignedPositions[0]).toBe(1);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 4: Duplicate waitlist entry is rejected ────────────────────────
// Feature: event-registration, Property 4: Duplicate waitlist entry is rejected

/**
 * Validates: Requirements 2.2
 *
 * For any student already on the waitlist for an event, a second waitlist
 * attempt returns a conflict error and the waitlist entry count for that
 * student+event pair remains unchanged.
 */
describe('Property 4 — Duplicate waitlist entry is rejected', () => {
  it('throws ConflictException and does not call eventWaitlist.create when entry already exists', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.uuid(), // eventId
        fc.integer({ min: 1, max: 50 }), // existing position
        async (userId, eventId, existingPosition) => {
          const mockPrisma = buildMockPrisma();
          const mockNotifications = buildMockNotifications();
          const service = await buildService(mockPrisma, mockNotifications);

          const waitlistCreate = jest.fn();

          const tx = {
            eventWaitlist: {
              findFirst: jest.fn().mockResolvedValue({
                id: 'existing-entry',
                userId,
                eventId,
                position: existingPosition,
                joinedAt: new Date(),
              }),
              aggregate: jest.fn().mockResolvedValue({ _max: { position: existingPosition } }),
              create: waitlistCreate,
            },
          };

          await expect(service.addToWaitlist(userId, eventId, tx as any)).rejects.toThrow(
            ConflictException,
          );

          // create must never be called when a duplicate is detected
          expect(waitlistCreate).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 5: Waitlist join triggers WAITLIST_JOINED notification ──────────
// Feature: event-registration, Property 5: Waitlist join triggers WAITLIST_JOINED notification

/**
 * Validates: Requirements 2.3
 *
 * For any student added to the waitlist, a notification of type WAITLIST_JOINED
 * is enqueued containing the student's assigned position number.
 */
describe('Property 5 — Waitlist join triggers WAITLIST_JOINED notification', () => {
  it('enqueues a WAITLIST_JOINED notification with the correct position', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.uuid(), // eventId
        fc.integer({ min: 0, max: 99 }), // current max position (0 means empty waitlist)
        async (userId, eventId, currentMax) => {
          const mockPrisma = buildMockPrisma();
          const mockNotifications = buildMockNotifications();
          const service = await buildService(mockPrisma, mockNotifications);

          const expectedPosition = currentMax + 1;

          const tx = {
            eventWaitlist: {
              findFirst: jest.fn().mockResolvedValue(null),
              aggregate: jest.fn().mockResolvedValue({
                _max: { position: currentMax === 0 ? null : currentMax },
              }),
              create: jest.fn().mockResolvedValue({
                id: 'new-entry',
                userId,
                eventId,
                position: expectedPosition,
                joinedAt: new Date(),
              }),
            },
          };

          await service.addToWaitlist(userId, eventId, tx as any);

          expect(mockNotifications.enqueueNotification).toHaveBeenCalledTimes(1);

          const notifCall = mockNotifications.enqueueNotification.mock.calls[0] as [
            string,
            string,
            string,
            NotificationType,
          ];
          const [calledUserId, , message, type] = notifCall;

          expect(calledUserId).toBe(userId);
          expect(type).toBe(NotificationType.WAITLIST_JOINED);
          // The message must contain the assigned position number
          expect(message).toContain(String(expectedPosition));
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 6: Promotion status matches event approval setting ──────────────
// Feature: event-registration, Property 6: Promotion status matches event approval setting

/**
 * Validates: Requirements 3.1, 3.2, 3.3
 *
 * For any waitlist entry that is promoted, the resulting registration status is
 * CONFIRMED if requiresApproval is false, and PENDING if requiresApproval is
 * true, and the waitlist entry is deleted.
 */
describe('Property 6 — Promotion status matches event approval setting', () => {
  it('creates registration with correct status and deletes waitlist entry', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // eventId
        fc.uuid(), // waitlisted userId
        fc.boolean(), // requiresApproval
        fc.integer({ min: 1, max: 50 }), // waitlist position
        async (eventId, waitlistedUserId, requiresApproval, position) => {
          const mockPrisma = buildMockPrisma();
          const mockNotifications = buildMockNotifications();
          const service = await buildService(mockPrisma, mockNotifications);

          const waitlistEntryId = 'waitlist-entry-1';
          const registrationCreate = jest.fn().mockResolvedValue({
            id: 'new-reg',
            userId: waitlistedUserId,
            eventId,
            statusId: requiresApproval ? PENDING_ID : CONFIRMED_ID,
            registrationDate: new Date(),
            deletedAt: null,
          });
          const waitlistDelete = jest.fn().mockResolvedValue({ id: waitlistEntryId });

          const tx = {
            eventWaitlist: {
              findFirst: jest.fn().mockResolvedValue({
                id: waitlistEntryId,
                userId: waitlistedUserId,
                eventId,
                position,
                joinedAt: new Date(),
              }),
              delete: waitlistDelete,
            },
            event: {
              findUnique: jest.fn().mockResolvedValue({ id: eventId, requiresApproval }),
            },
            registrationStatus: {
              findFirst: jest.fn().mockImplementation((args: { where: { name: string } }) => {
                const map: Record<string, string> = {
                  PENDING: PENDING_ID,
                  CONFIRMED: CONFIRMED_ID,
                };
                const id = map[args.where.name];
                return Promise.resolve(id ? { id } : null);
              }),
            },
            registration: {
              create: registrationCreate,
            },
          };

          const promoted = await service.promoteNext(eventId, tx as any);

          // The waitlist entry is returned
          expect(promoted).not.toBeNull();
          expect(promoted!.userId).toBe(waitlistedUserId);

          // Registration was created with the correct status
          expect(registrationCreate).toHaveBeenCalledTimes(1);
          const createArgs = registrationCreate.mock.calls[0] as [
            { data: { userId: string; eventId: string; statusId: string } },
          ];
          const expectedStatusId = requiresApproval ? PENDING_ID : CONFIRMED_ID;
          expect(createArgs[0].data.statusId).toBe(expectedStatusId);
          expect(createArgs[0].data.userId).toBe(waitlistedUserId);
          expect(createArgs[0].data.eventId).toBe(eventId);

          // Waitlist entry was deleted
          expect(waitlistDelete).toHaveBeenCalledTimes(1);
          const deleteArgs = waitlistDelete.mock.calls[0] as [{ where: { id: string } }];
          expect(deleteArgs[0]).toEqual({ where: { id: waitlistEntryId } });
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 7: Promotion triggers WAITLIST_PROMOTED notification ────────────
// Feature: event-registration, Property 7: Promotion triggers WAITLIST_PROMOTED notification

/**
 * Validates: Requirements 3.4
 *
 * For any student promoted from the waitlist, a notification of type
 * WAITLIST_PROMOTED is enqueued for that student.
 */
describe('Property 7 — Promotion triggers WAITLIST_PROMOTED notification', () => {
  it('enqueues a WAITLIST_PROMOTED notification for the promoted student', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // eventId
        fc.uuid(), // waitlisted userId
        fc.boolean(), // requiresApproval
        fc.integer({ min: 1, max: 50 }), // waitlist position
        async (eventId, waitlistedUserId, requiresApproval, position) => {
          const mockPrisma = buildMockPrisma();
          const mockNotifications = buildMockNotifications();
          const service = await buildService(mockPrisma, mockNotifications);

          const waitlistEntryId = 'waitlist-entry-1';

          const tx = {
            eventWaitlist: {
              findFirst: jest.fn().mockResolvedValue({
                id: waitlistEntryId,
                userId: waitlistedUserId,
                eventId,
                position,
                joinedAt: new Date(),
              }),
              delete: jest.fn().mockResolvedValue({ id: waitlistEntryId }),
            },
            event: {
              findUnique: jest.fn().mockResolvedValue({ id: eventId, requiresApproval }),
            },
            registrationStatus: {
              findFirst: jest.fn().mockImplementation((args: { where: { name: string } }) => {
                const map: Record<string, string> = {
                  PENDING: PENDING_ID,
                  CONFIRMED: CONFIRMED_ID,
                };
                const id = map[args.where.name];
                return Promise.resolve(id ? { id } : null);
              }),
            },
            registration: {
              create: jest.fn().mockResolvedValue({
                id: 'new-reg',
                userId: waitlistedUserId,
                eventId,
                statusId: requiresApproval ? PENDING_ID : CONFIRMED_ID,
                registrationDate: new Date(),
                deletedAt: null,
              }),
            },
          };

          await service.promoteNext(eventId, tx as any);

          expect(mockNotifications.enqueueNotification).toHaveBeenCalledTimes(1);

          const notifCall = mockNotifications.enqueueNotification.mock.calls[0] as [
            string,
            string,
            string,
            NotificationType,
          ];
          const [calledUserId, , , type] = notifCall;

          expect(calledUserId).toBe(waitlistedUserId);
          expect(type).toBe(NotificationType.WAITLIST_PROMOTED);
        },
      ),
      { numRuns: 100 },
    );
  });
});
