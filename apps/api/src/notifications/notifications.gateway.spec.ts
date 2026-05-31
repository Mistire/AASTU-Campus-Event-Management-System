import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationsGateway, NotificationPayload } from './notifications.gateway';
import { Socket, Server } from 'socket.io';

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface MockSocket {
  id: string;
  handshake: { query: Record<string, string>; headers: Record<string, string> };
  join: jest.Mock;
  disconnect: jest.Mock;
}

function buildMockSocket(token?: string, authHeader?: string): MockSocket {
  return {
    id: 'socket-test-id',
    handshake: {
      query: token ? { token } : {},
      headers: authHeader ? { authorization: authHeader } : {},
    },
    join: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
  };
}

function asSocket(mock: MockSocket): Socket {
  return mock as unknown as Socket;
}

// ─── Setup ────────────────────────────────────────────────────────────────────

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let jwtService: jest.Mocked<JwtService>;
  let mockServer: { to: jest.Mock };

  beforeEach(async () => {
    mockServer = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
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

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    jwtService = module.get(JwtService);

    // Inject mock server
    gateway.server = mockServer as unknown as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── 1. Valid JWT → join room ────────────────────────────────────────────────

  describe('handleConnection — valid JWT', () => {
    it('joins the client to the user private room when JWT is valid', async () => {
      const userId = 'user-abc-123';
      const client = buildMockSocket('valid.jwt.token');

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: userId });

      await gateway.handleConnection(asSocket(client));

      expect(client.join).toHaveBeenCalledWith(`user:${userId}`);
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('accepts token from Authorization header as fallback', async () => {
      const userId = 'user-xyz-456';
      const client = buildMockSocket(undefined, 'Bearer header.jwt.token');

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: userId });

      await gateway.handleConnection(asSocket(client));

      expect(client.join).toHaveBeenCalledWith(`user:${userId}`);
      expect(client.disconnect).not.toHaveBeenCalled();
    });
  });

  // ── 2. Invalid / missing JWT → disconnect ──────────────────────────────────

  describe('handleConnection — invalid or missing JWT', () => {
    it('disconnects the client when no token is provided', async () => {
      const client = buildMockSocket(); // no token

      await gateway.handleConnection(asSocket(client));

      expect(client.disconnect).toHaveBeenCalled();
      expect(client.join).not.toHaveBeenCalled();
    });

    it('disconnects the client when JWT verification throws', async () => {
      const client = buildMockSocket('bad.token');

      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('invalid signature'));

      await gateway.handleConnection(asSocket(client));

      expect(client.disconnect).toHaveBeenCalled();
      expect(client.join).not.toHaveBeenCalled();
    });

    it('disconnects the client when JWT payload has no sub', async () => {
      const client = buildMockSocket('no-sub.token');

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: undefined });

      await gateway.handleConnection(asSocket(client));

      expect(client.disconnect).toHaveBeenCalled();
      expect(client.join).not.toHaveBeenCalled();
    });
  });

  // ── 3. emitToUser payload shape ────────────────────────────────────────────

  describe('emitToUser', () => {
    it('calls server.to with the correct room and emits a notification event', () => {
      const userId = 'user-emit-test';
      const mockEmit = jest.fn();
      mockServer.to.mockReturnValue({ emit: mockEmit });

      const payload: NotificationPayload = {
        id: 'notif-id-1',
        title: 'Test Title',
        message: 'Test message body',
        type: 'ANNOUNCEMENT',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      };

      gateway.emitToUser(userId, payload);

      expect(mockServer.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockEmit).toHaveBeenCalledWith('notification', payload);
    });

    it('payload includes all required fields: id, title, message, type, createdAt', () => {
      const userId = 'user-payload-check';
      let capturedPayload: unknown;

      mockServer.to.mockReturnValue({
        emit: jest.fn((_event: string, data: unknown) => {
          capturedPayload = data;
        }),
      });

      const payload: NotificationPayload = {
        id: 'notif-id-2',
        title: 'Announcement Title',
        message: 'Announcement body',
        type: 'REGISTRATION_APPROVED',
        createdAt: new Date(),
      };

      gateway.emitToUser(userId, payload);

      const p = capturedPayload as NotificationPayload;
      expect(typeof p.id).toBe('string');
      expect(typeof p.title).toBe('string');
      expect(typeof p.message).toBe('string');
      expect(typeof p.type).toBe('string');
      expect(p.createdAt).toBeInstanceOf(Date);
    });
  });
});
