import { Test, TestingModule } from '@nestjs/testing';
import { TelegramService } from './telegram.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../auth/email.service';

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'TELEGRAM_BOT_TOKEN') return 'fake-token';
    if (key === 'TELEGRAM_CHANNEL_ID') return 'fake-channel';
    return null;
  }),
};

const mockPrismaService = {
  guestPass: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockEmailService = {
  sendEmail: jest.fn(),
};

describe('TelegramService', () => {
  let service: TelegramService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<TelegramService>(TelegramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEventAnnouncement', () => {
    it('should silently return if no bot is configured (or if we mock the bot away to prevent network calls)', async () => {
      // In tests, the Telegraf bot constructor is called, but we don't want real network calls.
      // We can assert it handles missing channels or missing event properly.
      mockConfigService.get.mockReturnValueOnce('fake-token').mockReturnValueOnce(null); // No channel ID
      const event = { id: 'evt1', title: 'Test', description: 'Desc', startTime: new Date(), endTime: new Date(), capacity: 100 };
      await expect(service.sendEventAnnouncement(event)).resolves.not.toThrow();
    });
  });

  describe('sendEventLiveAlert', () => {
    it('should return safely if no channel ID', async () => {
      mockConfigService.get.mockReturnValueOnce('fake-token').mockReturnValueOnce(null); // No channel ID
      const event = { id: 'evt1', title: 'Test', startTime: new Date() };
      await expect(service.sendEventLiveAlert(event)).resolves.not.toThrow();
    });
  });
});
