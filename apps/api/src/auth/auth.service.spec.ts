import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as argon from 'argon2';

// Mock dependencies
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  role: {
    findFirst: jest.fn(),
  },
  oneTimeToken: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  authSession: {
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb), // Mock transaction to just return array if it's passed an array of promises
};

const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config = {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRATION: '15m',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_REFRESH_EXPIRATION: '7d',
      EMAIL_VERIFICATION_TOKEN_TTL: '60',
      RESET_TOKEN_TTL_MINUTES: '30',
      TELEGRAM_BOT_TOKEN: '12345:test_bot_token'
    };
    return config[key];
  }),
};

const mockEmailService = {
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
};

const mockAuditLogsService = {
  createLog: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    const signUpDto = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      phone: '1234567890',
      roleName: 'Student'
    };

    it('should throw BadRequestException if email is already in use', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({ id: '1', email: 'test@example.com' });
      await expect(service.signUp(signUpDto)).rejects.toThrow(BadRequestException);
    });

    it('should successfully register a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null); // email not in use
      mockPrismaService.role.findFirst.mockResolvedValueOnce({ id: 'role-1', roleName: 'Student' });
      
      const createdUser = {
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
        role: { roleName: 'Student', permissions: [] }
      };
      
      mockPrismaService.user.create.mockResolvedValueOnce(createdUser);
      mockPrismaService.authSession.create.mockResolvedValueOnce({ id: 'session-1' });
      mockJwtService.signAsync.mockResolvedValue('token');
      mockEmailService.sendVerificationEmail.mockResolvedValueOnce(undefined);

      const result = await service.signUp(signUpDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();
      expect(mockAuditLogsService.createLog).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'Password123!' };

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if email is not verified', async () => {
      const hash = await argon.hash('Password123!');
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
        isEmailVerified: false,
        role: { roleName: 'Student', permissions: [] }
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should login successfully for verified user', async () => {
      const hash = await argon.hash('Password123!');
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
        isEmailVerified: true,
        role: { roleName: 'Student', permissions: [] }
      });
      mockPrismaService.authSession.create.mockResolvedValueOnce({ id: 'session-1' });
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await service.login(loginDto);
      expect(result).toHaveProperty('access_token');
    });
  });

  describe('logout', () => {
    it('should revoke session successfully', async () => {
      mockPrismaService.authSession.updateMany.mockResolvedValueOnce({ count: 1 });
      const result = await service.logout('user-1', 'session-1');
      expect(result.message).toBe('Logged out successfully');
      expect(mockPrismaService.authSession.updateMany).toHaveBeenCalledWith({
        where: { id: 'session-1', userId: 'user-1', isRevoked: false },
        data: { isRevoked: true, revokedAt: expect.any(Date) }
      });
    });
  });

});
