import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { WaitlistService, PrismaTransactionClient } from './waitlist.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';

// ─── Shared constants ─────────────────────────────────────────────────────────

const USER_ID = 'user-abc';
const EVENT_ID = 'event-xyz';
const STATUS_CONFIRMED_ID = 'status-confirmed';
const STATUS_PENDING_ID = 'status-pending';

// ─── Mock factories ───────────────────────────────────────────────────────────

function buildMockPrisma() {
  return {
    eventWaitlist: {
      findFirst: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    event: { findUnique: jest.fn() },
    registration: { create: jest.fn() },
    registrationStatus: { findFirst: jest.fn() },
  };
}

const mockNotifications = {
  enqueueNotification: jest.fn().mockResolvedValue(undefined),
};

// ─── Helper: build service ────────────────────────────────────────────────────

async function buildService(
  mockPrisma: ReturnType<typeof buildMockPrisma>,
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

// ─── Helper: build a tx mock ──────────────────────────────────────────────────

function buildTx(): ReturnType<typeof buildMockPrisma> & PrismaTransactionClient {
  return buildMockPrisma() as ReturnType<typeof buildMockPrisma> & PrismaTransactionClient;
}

// ─── Setup ────────────────────────────────────────────────────────────────────

afterEach(() => {
  jest.clearAllMocks();
});

// ─── addToWaitlist() ──────────────────────────────────────────────────────────

describe('WaitlistService.addToWaitlist()', () => {
  /**
   * Requirement 2.1 — position increments correctly (maxPos + 1)
   */
  it('assigns position = maxPos + 1 when entries already exist', async () => {
    const mockPrisma = buildMockPrisma();
    const service = await buildService(mockPrisma);
    const tx = buildTx();

    tx.eventWaitlist.findFirst.mockResolvedValue(null);
    tx.eventWaitlist.aggregate.mockResolvedValue({ _max: { position: 3 } });
    tx.eventWaitlist.create.mockResolvedValue({
      id: 'wl-1',
      userId: USER_ID,
      eventId: EVENT_ID,
      position: 4,
      joinedAt: new Date(),
    });

    const result = await service.addToWaitlist(USER_ID, EVENT_ID, tx);

    const createCall = tx.eventWaitlist.create.mock.calls[0] as [{ data: { position: number } }];
    expect(createCall[0].data.position).toBe(4);
    expect(result.position).toBe(4);
  });

  /**
   * Requirement 2.1 — first entry gets position 1 when waitlist is empty
   */
  it('assigns position 1 when the waitlist is empty (maxPos is null)', async () => {
    const mockPrisma = buildMockPrisma();
    const service = await buildService(mockPrisma);
    const tx = buildTx();

    tx.eventWaitlist.findFirst.mockResolvedValue(null);
    tx.eventWaitlist.aggregate.mockResolvedValue({ _max: { position: null } });
    tx.eventWaitlist.create.mockResolvedValue({
      id: 'wl-1',
      userId: USER_ID,
      eventId: EVENT_ID,
      position: 1,
      joinedAt: new Date(),
    });

    await service.addToWaitlist(USER_ID, EVENT_ID, tx);

    const createCall = tx.eventWaitlist.create.mock.calls[0] as [{ data: { position: number } }];
    expect(createCall[0].data.position).toBe(1);
  });

  /**
   * Requirement 2.2 — duplicate entry throws ConflictException
   */
  it('throws ConflictException when user already has a waitlist entry', async () => {
    const mockPrisma = buildMockPrisma();
    const service = await buildService(mockPrisma);
    const tx = buildTx();

    tx.eventWaitlist.findFirst.mockResolvedValue({
      id: 'wl-existing',
      userId: USER_ID,
      eventId: EVENT_ID,
      position: 2,
      joinedAt: new Date(),
    });

    await expect(service.addToWaitlist(USER_ID, EVENT_ID, tx)).rejects.toThrow(ConflictException);
    expect(tx.eventWaitlist.create).not.toHaveBeenCalled();
  });

  /**
   * Requirement 2.3 — WAITLIST_JOINED notification is enqueued with correct position
   */
  it('enqueues a WAITLIST_JOINED notification with the assigned position', async () => {
    const mockPrisma = buildMockPrisma();
    const service = await buildService(mockPrisma);
    const tx = buildTx();

    tx.eventWaitlist.findFirst.mockResolvedValue(null);
    tx.eventWaitlist.aggregate.mockResolvedValue({ _max: { position: 1 } });
    tx.eventWaitlist.create.mockResolvedValue({
      id: 'wl-1',
      userId: USER_ID,
      eventId: EVENT_ID,
      position: 2,
      joinedAt: new Date(),
    });

    await service.addToWaitlist(USER_ID, EVENT_ID, tx);

    expect(mockNotifications.enqueueNotification).toHaveBeenCalledWith(
      USER_ID,
      expect.any(String),
      expect.stringContaining('2'),
      NotificationType.WAITLIST_JOINED,
    );
  });
});

// ─── promoteNext() ────────────────────────────────────────────────────────────

describe('WaitlistService.promoteNext()', () => {
  /**
   * Requirement 3.6 — empty waitlist returns null (no-op)
   */
  it('returns null when the waitlist is empty', async () => {
    const mockPrisma = buildMockPrisma();
    const service = await buildService(mockPrisma);
    const tx = buildTx();

    tx.eventWaitlist.findFirst.mockResolvedValue(null);

    const result = await service.promoteNext(EVENT_ID, tx);

    expect(result).toBeNull();
    expect(tx.registration.create).not.toHaveBeenCalled();
    expect(tx.eventWaitlist.delete).not.toHaveBeenCalled();
  });

  /**
   * Requirement 3.2 — promotes with CONFIRMED status when requiresApproval=false
   */
  it('creates a CONFIRMED registration and deletes the entry when requiresApproval=false', async () => {
    const mockPrisma = buildMockPrisma();
    const service = await buildService(mockPrisma);
    const tx = buildTx();

    const entry = {
      id: 'wl-1',
      userId: USER_ID,
      eventId: EVENT_ID,
      position: 1,
      joinedAt: new Date(),
    };

    tx.eventWaitlist.findFirst.mockResolvedValue(entry);
    tx.event.findUnique.mockResolvedValue({ id: EVENT_ID, requiresApproval: false });
    tx.registrationStatus.findFirst.mockResolvedValue({
      id: STATUS_CONFIRMED_ID,
      name: 'CONFIRMED',
    });
    tx.registration.create.mockResolvedValue({
      id: 'reg-1',
      userId: USER_ID,
      eventId: EVENT_ID,
      statusId: STATUS_CONFIRMED_ID,
    });
    tx.eventWaitlist.delete.mockResolvedValue(entry);

    const result = await service.promoteNext(EVENT_ID, tx);

    const createCall = tx.registration.create.mock.calls[0] as [
      { data: { userId: string; eventId: string; statusId: string } },
    ];
    expect(createCall[0].data.userId).toBe(USER_ID);
    expect(createCall[0].data.eventId).toBe(EVENT_ID);
    expect(createCall[0].data.statusId).toBe(STATUS_CONFIRMED_ID);

    expect(tx.eventWaitlist.delete).toHaveBeenCalledWith({ where: { id: entry.id } });
    expect(result).toEqual(entry);
  });

  /**
   * Requirement 3.3 — promotes with PENDING status when requiresApproval=true
   */
  it('creates a PENDING registration and deletes the entry when requiresApproval=true', async () => {
    const mockPrisma = buildMockPrisma();
    const service = await buildService(mockPrisma);
    const tx = buildTx();

    const entry = {
      id: 'wl-2',
      userId: USER_ID,
      eventId: EVENT_ID,
      position: 1,
      joinedAt: new Date(),
    };

    tx.eventWaitlist.findFirst.mockResolvedValue(entry);
    tx.event.findUnique.mockResolvedValue({ id: EVENT_ID, requiresApproval: true });
    tx.registrationStatus.findFirst.mockResolvedValue({ id: STATUS_PENDING_ID, name: 'PENDING' });
    tx.registration.create.mockResolvedValue({
      id: 'reg-2',
      userId: USER_ID,
      eventId: EVENT_ID,
      statusId: STATUS_PENDING_ID,
    });
    tx.eventWaitlist.delete.mockResolvedValue(entry);

    const result = await service.promoteNext(EVENT_ID, tx);

    const statusCall = tx.registrationStatus.findFirst.mock.calls[0] as [
      { where: { name: string } },
    ];
    expect(statusCall[0].where.name).toBe('PENDING');

    const createCall = tx.registration.create.mock.calls[0] as [{ data: { statusId: string } }];
    expect(createCall[0].data.statusId).toBe(STATUS_PENDING_ID);

    expect(tx.eventWaitlist.delete).toHaveBeenCalledWith({ where: { id: entry.id } });
    expect(result).toEqual(entry);
  });

  /**
   * Requirement 3.4 — WAITLIST_PROMOTED notification is enqueued after promotion
   */
  it('enqueues a WAITLIST_PROMOTED notification for the promoted user', async () => {
    const mockPrisma = buildMockPrisma();
    const service = await buildService(mockPrisma);
    const tx = buildTx();

    const entry = {
      id: 'wl-3',
      userId: USER_ID,
      eventId: EVENT_ID,
      position: 1,
      joinedAt: new Date(),
    };

    tx.eventWaitlist.findFirst.mockResolvedValue(entry);
    tx.event.findUnique.mockResolvedValue({ id: EVENT_ID, requiresApproval: false });
    tx.registrationStatus.findFirst.mockResolvedValue({
      id: STATUS_CONFIRMED_ID,
      name: 'CONFIRMED',
    });
    tx.registration.create.mockResolvedValue({});
    tx.eventWaitlist.delete.mockResolvedValue(entry);

    await service.promoteNext(EVENT_ID, tx);

    expect(mockNotifications.enqueueNotification).toHaveBeenCalledWith(
      USER_ID,
      expect.any(String),
      expect.any(String),
      NotificationType.WAITLIST_PROMOTED,
    );
  });

  /**
   * Requirement 3.1 — promotes the lowest-position entry first
   */
  it('selects the entry with the lowest position (orderBy asc)', async () => {
    const mockPrisma = buildMockPrisma();
    const service = await buildService(mockPrisma);
    const tx = buildTx();

    const lowestEntry = {
      id: 'wl-low',
      userId: 'user-first',
      eventId: EVENT_ID,
      position: 1,
      joinedAt: new Date(),
    };

    tx.eventWaitlist.findFirst.mockResolvedValue(lowestEntry);
    tx.event.findUnique.mockResolvedValue({ id: EVENT_ID, requiresApproval: false });
    tx.registrationStatus.findFirst.mockResolvedValue({ id: STATUS_CONFIRMED_ID });
    tx.registration.create.mockResolvedValue({});
    tx.eventWaitlist.delete.mockResolvedValue(lowestEntry);

    await service.promoteNext(EVENT_ID, tx);

    const findCall = tx.eventWaitlist.findFirst.mock.calls[0] as [
      { orderBy: { position: string } },
    ];
    expect(findCall[0].orderBy).toEqual({ position: 'asc' });

    const createCall = tx.registration.create.mock.calls[0] as [{ data: { userId: string } }];
    expect(createCall[0].data.userId).toBe('user-first');
  });
});
