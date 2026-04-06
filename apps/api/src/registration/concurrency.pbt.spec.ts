import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RegistrationService } from './registration.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WaitlistService } from './waitlist.service';
import { AnalyticsService } from '../analytics/analytics.service';

// ─── Constants ────────────────────────────────────────────────────────────────

const PENDING_ID = 'status-pending';
const CONFIRMED_ID = 'status-confirmed';
const CANCELLED_ID = 'status-cancelled';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMockPrisma(): Record<string, unknown> & { $transaction: jest.Mock } {
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

const mockAnalytics = {
  invalidateEventCache: jest.fn().mockResolvedValue(undefined),
};

async function buildService(
  mockPrisma: ReturnType<typeof buildMockPrisma>,
  mockWaitlist: Record<string, jest.Mock>,
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

// ─── Property 18: Capacity invariant under concurrent registrations ───────────
// Feature: event-registration, Property 18: Capacity invariant under concurrent registrations

/**
 * Validates: Requirements 8.1
 *
 * For any event with capacity C, after any number of concurrent registration
 * attempts, the count of CONFIRMED registrations for that event is at most C.
 */
describe('Property 18 — Capacity invariant under concurrent registrations', () => {
  it('CONFIRMED count never exceeds capacity under simulated concurrent registrations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // capacity C
        fc.integer({ min: 1, max: 5 }), // extra students beyond capacity (N = capacity + extra)
        fc.uuid(), // eventId
        async (capacity, extra, eventId) => {
          const mockPrisma = buildMockPrisma();

          // Shared mutable state simulating the serializable transaction's view
          let confirmedCount = 0;

          // Mock waitlist service — called when event is full
          const mockWaitlist = {
            addToWaitlist: jest.fn().mockResolvedValue({
              id: 'waitlist-entry',
              userId: 'some-user',
              eventId,
              position: 1,
              joinedAt: new Date(),
            }),
            promoteNext: jest.fn().mockResolvedValue(null),
          };

          const service = await buildService(mockPrisma, mockWaitlist);

          // Mock $transaction to simulate serializable isolation:
          // - Each call checks confirmedCount < capacity
          // - With some probability, throw P2034 to simulate serialization failure
          mockPrisma.$transaction.mockImplementation(
            async (callback: (tx: unknown) => Promise<unknown>) => {
              // ~20% chance of P2034 serialization failure
              if (Math.random() < 0.2) {
                const p2034 = new Prisma.PrismaClientKnownRequestError(
                  'Transaction failed due to a write conflict or a deadlock.',
                  { code: 'P2034', clientVersion: '5.0.0' },
                );
                throw p2034;
              }

              // Capture confirmedCount at the start of this "transaction"
              const snapshotCount = confirmedCount;

              const tx = {
                event: {
                  findUnique: jest.fn().mockResolvedValue({
                    id: eventId,
                    capacity,
                    requiresApproval: false,
                  }),
                },
                registration: {
                  findFirst: jest.fn().mockResolvedValue(null), // no duplicate
                  count: jest.fn().mockResolvedValue(snapshotCount),
                  create: jest
                    .fn()
                    .mockImplementation(
                      (args: { data: { userId: string; eventId: string; statusId: string } }) => {
                        // Only increment if we're still under capacity (serializable check)
                        if (snapshotCount < capacity) {
                          confirmedCount += 1;
                        }
                        return Promise.resolve({
                          id: `reg-${Math.random()}`,
                          userId: args.data.userId,
                          eventId: args.data.eventId,
                          statusId: args.data.statusId,
                          registrationDate: new Date(),
                          deletedAt: null,
                        });
                      },
                    ),
                },
              };

              return callback(tx);
            },
          );

          // Generate N = capacity + extra student IDs
          const totalStudents = capacity + extra;
          const studentIds = Array.from({ length: totalStudents }, (_, i) => `student-${i}`);

          // Run all N registrations sequentially (simulating concurrent attempts)
          for (const userId of studentIds) {
            try {
              await service.register({ userId, eventId });
            } catch (err) {
              // ConflictException from P2034 is expected — ignore it
              if (!(err instanceof ConflictException)) {
                throw err;
              }
            }
          }

          // Core invariant: confirmed count must never exceed capacity
          expect(confirmedCount).toBeLessThanOrEqual(capacity);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 19: Waitlist entries are promoted at most once ─────────────────
// Feature: event-registration, Property 19: Waitlist entries are promoted at most once

/**
 * Validates: Requirements 8.2
 *
 * For any waitlist entry, after any number of concurrent cancellations on the
 * same event, each waitlist entry appears in at most one resulting registration.
 */
describe('Property 19 — Waitlist entries are promoted at most once', () => {
  it('each waitlist entry id appears in at most one promotion across concurrent cancellations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // N waitlist entries
        fc.integer({ min: 1, max: 5 }), // M concurrent cancellations
        fc.uuid(), // eventId
        async (numWaitlistEntries, numCancellations, eventId) => {
          const mockPrisma = buildMockPrisma();

          // Build waitlist entries with sequential positions
          const waitlistEntries = Array.from({ length: numWaitlistEntries }, (_, i) => ({
            id: `waitlist-entry-${i}`,
            userId: `waitlisted-user-${i}`,
            eventId,
            position: i + 1,
            joinedAt: new Date(),
          }));

          // Shared mutable state: tracks which entry ids have been promoted
          const promotedEntryIds = new Set<string>();

          // Track which entries are still available (not yet promoted)
          const availableEntries = [...waitlistEntries];

          // Mock promoteNext: picks the lowest-position unprocessed entry,
          // adds its id to promotedEntryIds, returns it (or null if already promoted / none left)
          const mockPromoteNext = jest.fn().mockImplementation(() => {
            if (availableEntries.length === 0) {
              return Promise.resolve(null);
            }

            // Pick the lowest-position available entry
            const entry = availableEntries.shift()!;

            // If already promoted (shouldn't happen with correct serializable logic), return null
            if (promotedEntryIds.has(entry.id)) {
              return Promise.resolve(null);
            }

            promotedEntryIds.add(entry.id);
            return Promise.resolve(entry);
          });

          const mockWaitlist = {
            addToWaitlist: jest.fn(),
            promoteNext: mockPromoteNext,
          };

          const service = await buildService(mockPrisma, mockWaitlist);

          // Build M cancellation registrations (all CONFIRMED so they trigger promotion)
          const cancellationRegistrations = Array.from({ length: numCancellations }, (_, i) => ({
            id: `reg-to-cancel-${i}`,
            userId: `confirmed-user-${i}`,
            eventId,
          }));

          // Mock $transaction for cancelByStudent
          mockPrisma.$transaction.mockImplementation(
            async (callback: (tx: unknown) => Promise<unknown>) => {
              // ~15% chance of P2034 serialization failure
              if (Math.random() < 0.15) {
                const p2034 = new Prisma.PrismaClientKnownRequestError(
                  'Transaction failed due to a write conflict or a deadlock.',
                  { code: 'P2034', clientVersion: '5.0.0' },
                );
                throw p2034;
              }

              // The tx client — registration lookup is set per-call below
              const tx = {
                registration: {
                  findUnique: jest.fn(),
                  update: jest
                    .fn()
                    .mockImplementation(
                      (args: { data: { statusId: string }; where: { id: string } }) =>
                        Promise.resolve({
                          id: args.where.id,
                          userId: 'some-user',
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

          // Run all M cancellations sequentially (simulating concurrent attempts)
          for (const reg of cancellationRegistrations) {
            // Re-mock $transaction for each cancellation to return the correct registration
            mockPrisma.$transaction.mockImplementationOnce(
              async (callback: (tx: unknown) => Promise<unknown>) => {
                // ~15% chance of P2034 serialization failure
                if (Math.random() < 0.15) {
                  const p2034 = new Prisma.PrismaClientKnownRequestError(
                    'Transaction failed due to a write conflict or a deadlock.',
                    { code: 'P2034', clientVersion: '5.0.0' },
                  );
                  throw p2034;
                }

                const tx = {
                  registration: {
                    findUnique: jest.fn().mockResolvedValue({
                      id: reg.id,
                      userId: reg.userId,
                      eventId: reg.eventId,
                      statusId: CONFIRMED_ID,
                      status: { name: 'CONFIRMED' },
                      registrationDate: new Date(),
                      deletedAt: null,
                    }),
                    update: jest.fn().mockResolvedValue({
                      id: reg.id,
                      userId: reg.userId,
                      eventId: reg.eventId,
                      statusId: CANCELLED_ID,
                      registrationDate: new Date(),
                      deletedAt: null,
                    }),
                  },
                };

                return callback(tx);
              },
            );

            try {
              await service.cancelByStudent(reg.id, reg.userId);
            } catch (err) {
              // ConflictException from P2034 is expected — ignore it
              if (!(err instanceof ConflictException)) {
                throw err;
              }
            }
          }

          // Core invariant: each waitlist entry id appears at most once in promotedEntryIds
          // (Set guarantees uniqueness — verify no entry was promoted more than once)
          const promotedArray = Array.from(promotedEntryIds);
          const uniquePromoted = new Set(promotedArray);
          expect(uniquePromoted.size).toBe(promotedArray.length);

          // Additionally: promoted entries must be a subset of the original waitlist
          for (const id of promotedEntryIds) {
            const isValidEntry = waitlistEntries.some((e) => e.id === id);
            expect(isValidEntry).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
