import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  $transaction(arg0: any[]) {
    throw new Error('Method not implemented.');
  }
  private pool: Pool;
  // eventStatus: any;
  // event: any;
  // eventOrganizers: any;
  // user: any;
  // registration: any;
  // eventTags: any;
  // eventCategory: any;
  // eventSessions: any;
  // sessionSpeakers: any;
  // sessionMedia: any;
  // attendance: any;
  // formFields: any;
  // formResponses: any;
  // eventInvites: any;
  // announcements: any;
  // eventAccess: any;
  // eventMedia: any;
  // eventWaitlist: any;
  // hackathons: any;
  constructor(config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');
    const enableQueryLogs =
      String(config.get<string>('PRISMA_LOG_QUERIES') ?? 'false').toLowerCase() === 'true';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter: adapter,
      log: enableQueryLogs ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
    });

    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      console.error('PrismaService.onModuleInit error:', err);
      throw err;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      await this.pool.end();
    } catch (err) {
      console.error('PrismaService.onModuleDestroy error:', err);
      throw err;
    }
  }
}
