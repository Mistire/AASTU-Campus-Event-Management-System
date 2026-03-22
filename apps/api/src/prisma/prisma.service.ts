import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
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
