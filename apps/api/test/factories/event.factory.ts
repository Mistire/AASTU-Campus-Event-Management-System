import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';

export class EventFactory {
  constructor(private readonly prisma: PrismaService) {}

  async create(overrides?: any) {
    const defaultStatusId = overrides?.statusId || (await this.getOrCreateStatus('PUBLISHED')).id;
    const defaultVenueId = overrides?.venueId || (await this.getOrCreateVenue()).id;
    
    const uniqueSuffix = randomUUID().split('-')[0];
    const now = new Date();
    
    return this.prisma.event.create({
      data: {
        title: overrides?.title || `Test Event ${uniqueSuffix}`,
        description: overrides?.description || 'Test event description',
        statusId: defaultStatusId,
        venueId: defaultVenueId,
        startTime: overrides?.startTime || new Date(now.getTime() + 86400000), // tomorrow
        endTime: overrides?.endTime || new Date(now.getTime() + 86400000 + 3600000), // tomorrow + 1 hr
        capacity: overrides?.capacity ?? 100,
        requiresApproval: overrides?.requiresApproval ?? false,
        createdBy: overrides?.createdBy || undefined,
        ...overrides,
      },
      include: {
        status: true,
        venue: true,
        creator: true,
      },
    });
  }

  private async getOrCreateStatus(statusName: string) {
    let status = await this.prisma.eventStatus.findUnique({ where: { statusName } });
    if (!status) {
      status = await this.prisma.eventStatus.create({
        data: { statusName, description: 'Created by EventFactory' },
      });
    }
    return status;
  }

  private async getOrCreateVenue() {
    const venueName = 'Main Hall Test';
    let venue = await this.prisma.venue.findFirst({ where: { name: venueName } });
    if (!venue) {
      venue = await this.prisma.venue.create({
        data: { name: venueName, capacity: 500 },
      });
    }
    return venue;
  }
}
