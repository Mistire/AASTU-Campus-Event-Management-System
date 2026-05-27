import { PrismaService } from 'src/prisma/prisma.service';

export class DatabaseCleaner {
  constructor(private readonly prisma: PrismaService) {}

  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('DatabaseCleaner should only be used in the test environment!');
    }

    const tablenames = await this.prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    try {
      await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.log({ error });
    }
  }
}
