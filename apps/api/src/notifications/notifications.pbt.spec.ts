import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway, NotificationPayload } from './notifications.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from './enums/notification-type.enum';
import { Server } from 'socket.io';

// ─── Shared arbitraries ───────────────────────────────────────────────────────

const notificationTypeArb = fc.constantFrom(...Object.values(NotificationType));

const notificationArb = fc.record({
  id: fc.uuid(),
  userId: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  message: fc.string({ minLength: 1, maxLength: 500 }),
  type: notificationTypeArb,
  isRead: fc.boolean(),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
});

// ─── Property 16 ─────────────────────────────────────────────────────────────

/**
 * // Feature: event-registration, Property 16: Notifications are returned in descending creation order
 *
 * Validates: Requirements 7.1
 *
 * For any set of notifications belonging to a user, the paginated retrieval
 * endpoint returns them ordered by `createdAt` descending. Since the service
 * delegates ordering to Prisma via `orderBy: { createdAt: 'desc' }`, we assert
 * that `findMany` is always called with that exact `orderBy` argument regardless
 * of the input data.
 */
describe('Property 16 — Notifications are returned in descending creation order', () => {
  let service: NotificationsService;
  let mockFindMany: jest.Mock;
  let mockCount: jest.Mock;

  beforeEach(async () => {
    mockFindMany = jest.fn();
    mockCount = jest.fn().mockResolvedValue(0);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              findMany: mockFindMany,
              count: mockCount,
            },
          },
        },
        {
          provide: 'BullQueue_notification',
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(NotificationsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('always calls findMany with orderBy: { createdAt: "desc" } regardless of input', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.array(notificationArb, { minLength: 0, maxLength: 20 }), // notifications
        fc.record({
          page: fc.integer({ min: 1, max: 10 }),
          limit: fc.integer({ min: 1, max: 50 }),
          isRead: fc.option(fc.boolean(), { nil: undefined }),
        }),
        async (userId, notifications, query) => {
          mockFindMany.mockResolvedValue(notifications);
          mockCount.mockResolvedValue(notifications.length);

          await service.findAllForUser(userId, query);

          expect(mockFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
              orderBy: { createdAt: 'desc' },
            }),
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 17 ─────────────────────────────────────────────────────────────

/**
 * // Feature: event-registration, Property 17: Mark-as-read round trip
 *
 * Validates: Requirements 7.2
 *
 * For any notification, after calling `markAsRead`, the returned notification
 * has `isRead = true`.
 */
describe('Property 17 — Mark-as-read round trip', () => {
  let service: NotificationsService;
  let mockFindUnique: jest.Mock;
  let mockUpdate: jest.Mock;

  beforeEach(async () => {
    mockFindUnique = jest.fn();
    mockUpdate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              findUnique: mockFindUnique,
              update: mockUpdate,
            },
          },
        },
        {
          provide: 'BullQueue_notification',
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(NotificationsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('always returns isRead = true after markAsRead regardless of prior state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // notificationId
        fc.uuid(), // userId
        notificationArb,
        async (notificationId, userId, notification) => {
          // Ownership check returns the same userId
          mockFindUnique.mockResolvedValue({ userId });

          // update returns the notification with isRead forced to true
          const updatedNotification = { ...notification, id: notificationId, userId, isRead: true };
          mockUpdate.mockResolvedValue(updatedNotification);

          const result = await service.markAsRead(notificationId, userId);

          expect(result.isRead).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 15 ─────────────────────────────────────────────────────────────

/**
 * // Feature: event-registration, Property 15: Notification payload contains all required fields
 *
 * Validates: Requirements 6.5
 *
 * For any notification emitted by the Socket.IO gateway, the payload includes
 * `id`, `title`, `message`, `type`, and `createdAt` fields with correct types.
 */
describe('Property 15 — Notification payload contains all required fields', () => {
  let gateway: NotificationsGateway;
  let mockEmit: jest.Mock;

  beforeEach(async () => {
    mockEmit = jest.fn();
    const mockServer = {
      to: jest.fn().mockReturnValue({ emit: mockEmit }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-secret') },
        },
      ],
    }).compile();

    gateway = module.get(NotificationsGateway);
    gateway.server = mockServer as unknown as Server;
  });

  afterEach(() => jest.clearAllMocks());

  it('emitted payload always contains id, title, message, type, and createdAt with correct types', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // userId
        fc.record({
          id: fc.uuid(),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          message: fc.string({ minLength: 1, maxLength: 500 }),
          type: notificationTypeArb,
          createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
        }),
        (userId, payload: NotificationPayload) => {
          let capturedPayload: unknown;
          mockEmit.mockImplementation((_event: string, data: unknown) => {
            capturedPayload = data;
          });

          gateway.emitToUser(userId, payload);

          const p = capturedPayload as NotificationPayload;

          expect(typeof p.id).toBe('string');
          expect(typeof p.title).toBe('string');
          expect(typeof p.message).toBe('string');
          expect(typeof p.type).toBe('string');
          expect(p.createdAt).toBeInstanceOf(Date);

          // All fields must be present (not undefined/null)
          expect(p.id).toBeDefined();
          expect(p.title).toBeDefined();
          expect(p.message).toBeDefined();
          expect(p.type).toBeDefined();
          expect(p.createdAt).toBeDefined();
        },
      ),
      { numRuns: 100 },
    );
  });
});
