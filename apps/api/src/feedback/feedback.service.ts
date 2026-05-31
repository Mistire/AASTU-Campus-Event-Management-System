import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../auth/email.service';
import { CreateFeedbackTemplateDto } from './dto/create-template.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';

interface FeedbackJwtPayload {
  sub: string; // feedbackToken record id
  userId: string;
  eventId: string;
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  // ─── Default System Template ──────────────────────────────────────────────

  private get defaultQuestions() {
    return [
      {
        id: 'default-q1',
        label: 'How would you rate this event overall?',
        type: 'RATING' as const,
        options: null,
        isRequired: true,
        order: 0,
      },
      {
        id: 'default-q2',
        label: 'What did you enjoy most about the event?',
        type: 'TEXT' as const,
        options: null,
        isRequired: false,
        order: 1,
      },
      {
        id: 'default-q3',
        label: 'What could be improved?',
        type: 'TEXT' as const,
        options: null,
        isRequired: false,
        order: 2,
      },
      {
        id: 'default-q4',
        label: 'How likely are you to attend future events?',
        type: 'SCALE' as const,
        options: null,
        isRequired: true,
        order: 3,
      },
    ];
  }

  private async getOrCreateDefaultTemplate(createdBy: string | null) {
    let template = await this.prisma.feedbackFormTemplate.findFirst({
      where: { isDefault: true },
      include: { questions: { orderBy: { order: 'asc' } } },
    });

    if (!template) {
      let finalCreatedBy = createdBy;
      if (!finalCreatedBy) {
        const fallbackUser =
          (await this.prisma.user.findFirst({
            where: { role: { roleName: { in: ['ADMIN', 'ORGANIZER'] } } },
          })) || (await this.prisma.user.findFirst());
        finalCreatedBy = fallbackUser?.id || null;
      }

      if (!finalCreatedBy) {
        throw new Error(
          'Cannot create default feedback template: No user found to assign as creator.',
        );
      }

      template = await this.prisma.feedbackFormTemplate.create({
        data: {
          name: 'Default Event Feedback Template',
          isDefault: true,
          createdBy: finalCreatedBy,
          questions: {
            create: [
              {
                label: 'How would you rate this event overall?',
                type: 'RATING',
                isRequired: true,
                order: 0,
              },
              {
                label: 'What did you enjoy most about the event?',
                type: 'TEXT',
                isRequired: false,
                order: 1,
              },
              {
                label: 'What could be improved?',
                type: 'TEXT',
                isRequired: false,
                order: 2,
              },
              {
                label: 'How likely are you to attend future events?',
                type: 'SCALE',
                isRequired: true,
                order: 3,
              },
            ],
          },
        },
        include: { questions: { orderBy: { order: 'asc' } } },
      });
    }

    return template;
  }

  // ─── Token helpers ────────────────────────────────────────────────────────

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private signFeedbackJwt(feedbackTokenId: string, userId: string, eventId: string): string {
    return this.jwtService.sign(
      { sub: feedbackTokenId, userId, eventId } satisfies FeedbackJwtPayload,
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '14d',
      },
    );
  }

  private verifyFeedbackJwt(token: string): FeedbackJwtPayload {
    try {
      return this.jwtService.verify<FeedbackJwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new BadRequestException('Invalid or expired feedback token');
    }
  }

  // ─── Dispatch feedback emails after event archive ─────────────────────────

  async dispatchFeedbackEmails(eventId: string): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { venue: true },
    });
    if (!event) return;

    // 1. CONFIRMED registrants
    const registrations = await this.prisma.registration.findMany({
      where: {
        eventId,
        deletedAt: null,
        status: { name: { equals: 'CONFIRMED', mode: 'insensitive' } },
      },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });

    // 2. Invited guests who have an Attendance record
    const attendedInvites = await this.prisma.eventInvites.findMany({
      where: {
        eventId,
        userId: { not: null },
        attendance: { some: { eventId } },
      },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });

    // Deduplicate by userId
    const recipientMap = new Map<string, { id: string; email: string; fullName: string }>();
    for (const r of registrations) {
      if (r.userId) recipientMap.set(r.userId, r.user);
    }
    for (const inv of attendedInvites) {
      if (inv.userId && inv.user) recipientMap.set(inv.userId, inv.user);
    }

    const recipients = Array.from(recipientMap.values());
    if (recipients.length === 0) {
      this.logger.log(`No eligible recipients for feedback on event ${eventId}`);
      return;
    }

    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    for (const user of recipients) {
      try {
        // Upsert FeedbackToken (idempotent — safe to call multiple times)
        const existingToken = await this.prisma.feedbackToken.findUnique({
          where: { eventId_userId: { eventId, userId: user.id } },
        });
        if (existingToken?.usedAt) continue; // already submitted, skip

        let feedbackTokenRecord = existingToken;
        if (!feedbackTokenRecord) {
          // Create a placeholder record first to get the id
          feedbackTokenRecord = await this.prisma.feedbackToken.create({
            data: {
              tokenHash: 'pending',
              eventId,
              userId: user.id,
              expiresAt,
            },
          });
        }

        const jwt = this.signFeedbackJwt(feedbackTokenRecord.id, user.id, eventId);
        const tokenHash = this.hashToken(jwt);

        await this.prisma.feedbackToken.update({
          where: { id: feedbackTokenRecord.id },
          data: { tokenHash },
        });

        const feedbackUrl = `${frontendUrl}/feedback/${encodeURIComponent(jwt)}`;
        const firstName = user.fullName.split(' ')[0];

        await this.emailService.sendFeedbackRequestEmail(
          user.email,
          firstName,
          event.title,
          feedbackUrl,
        );

        this.logger.log(`Feedback email sent to ${user.email} for event ${event.title}`);
      } catch (err) {
        this.logger.error(`Failed to send feedback email to ${user.email}: ${err.message}`);
      }
    }
  }

  // ─── Resolve token → return form data (public endpoint) ──────────────────

  async resolveFeedbackForm(rawToken: string) {
    const payload = this.verifyFeedbackJwt(rawToken);

    const tokenRecord = await this.prisma.feedbackToken.findUnique({
      where: { id: payload.sub },
      include: {
        event: {
          include: {
            venue: true,
            feedbackTemplates: {
              include: {
                template: {
                  include: { questions: { orderBy: { order: 'asc' } } },
                },
              },
            },
          },
        },
        user: { select: { fullName: true } },
      },
    });

    if (!tokenRecord) throw new BadRequestException('Invalid feedback token');
    if (new Date() > tokenRecord.expiresAt) {
      throw new BadRequestException('This feedback link has expired');
    }

    const alreadySubmitted = !!tokenRecord.usedAt;

    // Resolve questions: prefer event-specific template, else default
    const eventTemplate = tokenRecord.event.feedbackTemplates[0]?.template;
    let questions;
    if (eventTemplate) {
      questions = eventTemplate.questions.map((q) => ({
        id: q.id,
        label: q.label,
        type: q.type,
        options: q.options,
        isRequired: q.isRequired,
        order: q.order,
      }));
    } else {
      const defaultTemplate = await this.getOrCreateDefaultTemplate(tokenRecord.event.createdBy);
      questions = defaultTemplate.questions.map((q) => ({
        id: q.id,
        label: q.label,
        type: q.type,
        options: q.options,
        isRequired: q.isRequired,
        order: q.order,
      }));
    }

    return {
      alreadySubmitted,
      eventTitle: tokenRecord.event.title,
      eventDate: tokenRecord.event.startTime,
      venueName: tokenRecord.event.venue?.name ?? null,
      attendeeName: tokenRecord.user.fullName.split(' ')[0],
      questions,
    };
  }

  // ─── Submit feedback (public endpoint) ───────────────────────────────────

  async submitFeedback(rawToken: string, dto: SubmitFeedbackDto) {
    const payload = this.verifyFeedbackJwt(rawToken);

    const tokenRecord = await this.prisma.feedbackToken.findUnique({
      where: { id: payload.sub },
      include: { event: true },
    });

    if (!tokenRecord) throw new BadRequestException('Invalid feedback token');
    if (new Date() > tokenRecord.expiresAt) {
      throw new BadRequestException('This feedback link has expired');
    }
    if (tokenRecord.usedAt) {
      throw new ConflictException('Feedback has already been submitted for this event');
    }

    // Detect if using default or custom questions
    const eventTemplate = await this.prisma.eventFeedbackTemplate.findFirst({
      where: { eventId: payload.eventId },
      include: { template: { include: { questions: true } } },
    });

    const isDefaultForm = !eventTemplate;

    let validIds: Set<string>;
    let defaultTemplate: any = null;

    if (!isDefaultForm && eventTemplate) {
      validIds = new Set(eventTemplate.template.questions.map((q) => q.id));
    } else {
      defaultTemplate = await this.getOrCreateDefaultTemplate(tokenRecord.event.createdBy);
      validIds = new Set(defaultTemplate.questions.map((q) => q.id));
    }

    // Validate and map questionIds
    for (const answer of dto.answers) {
      if (!validIds.has(answer.questionId)) {
        // Fallback mapping for clients sending static default question IDs (e.g. default-q1)
        if (isDefaultForm && answer.questionId.startsWith('default-q')) {
          const idx = parseInt(answer.questionId.split('-q')[1]) - 1;
          const dbQ = defaultTemplate.questions[idx];
          if (dbQ) {
            answer.questionId = dbQ.id;
            continue;
          }
        }
        throw new BadRequestException(`Unknown question id: ${answer.questionId}`);
      }
    }

    // Create response + answers in a transaction
    await this.prisma.$transaction(async (tx) => {
      const response = await tx.feedbackResponse.create({
        data: {
          tokenId: tokenRecord.id,
          eventId: payload.eventId,
          userId: payload.userId,
        },
      });

      await tx.feedbackAnswer.createMany({
        data: dto.answers.map((a) => ({
          responseId: response.id,
          questionId: a.questionId,
          value: a.value,
        })),
      });

      await tx.feedbackToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      });
    });

    return { message: 'Thank you! Your feedback has been submitted.' };
  }

  // ─── Admin: all responses ─────────────────────────────────────────────────

  async listAllResponses(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.feedbackResponse.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          event: { select: { id: true, title: true } },
          answers: {
            include: { question: { select: { label: true, type: true } } },
          },
        },
      }),
      this.prisma.feedbackResponse.count(),
    ]);

    return {
      data: data.map((r) => this.formatResponseForAdmin(r)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Organizer: responses for their events ────────────────────────────────

  async listResponsesForOrganizer(organizerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Get events this organizer manages
    const organizerEvents = await this.prisma.eventOrganizers.findMany({
      where: { userId: organizerId, status: 'ACCEPTED' },
      select: { eventId: true },
    });
    const createdEvents = await this.prisma.event.findMany({
      where: { createdBy: organizerId },
      select: { id: true },
    });
    const eventIds = [
      ...new Set([...organizerEvents.map((e) => e.eventId), ...createdEvents.map((e) => e.id)]),
    ];

    if (eventIds.length === 0) return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };

    const [data, total] = await Promise.all([
      this.prisma.feedbackResponse.findMany({
        where: { eventId: { in: eventIds } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          event: { select: { id: true, title: true } },
          answers: {
            include: { question: { select: { label: true, type: true } } },
          },
        },
      }),
      this.prisma.feedbackResponse.count({ where: { eventId: { in: eventIds } } }),
    ]);

    return {
      data: data.map((r) => this.formatResponseForOrganizer(r)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Responses for a specific event ──────────────────────────────────────

  async listResponsesForEvent(eventId: string, requesterId: string, requesterRole: string) {
    const isAdmin = requesterRole?.toUpperCase() === 'ADMIN';

    if (!isAdmin) {
      // Verify organizer owns this event
      const isOrganizer = await this.prisma.eventOrganizers.findFirst({
        where: { eventId, userId: requesterId, status: 'ACCEPTED' },
      });
      const isCreator = await this.prisma.event.findFirst({
        where: { id: eventId, createdBy: requesterId },
      });
      if (!isOrganizer && !isCreator) {
        throw new ForbiddenException("You do not have access to this event's feedback");
      }
    }

    const responses = await this.prisma.feedbackResponse.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        event: { select: { id: true, title: true } },
        answers: {
          include: { question: { select: { label: true, type: true } } },
        },
      },
    });

    return responses.map((r) =>
      isAdmin ? this.formatResponseForAdmin(r) : this.formatResponseForOrganizer(r),
    );
  }

  // ─── Templates ────────────────────────────────────────────────────────────

  async listTemplates(userId: string) {
    return this.prisma.feedbackFormTemplate.findMany({
      where: { createdBy: userId },
      include: { questions: { orderBy: { order: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createTemplate(userId: string, dto: CreateFeedbackTemplateDto) {
    return this.prisma.feedbackFormTemplate.create({
      data: {
        name: dto.name,
        createdBy: userId,
        questions: {
          create: dto.questions.map((q) => ({
            label: q.label,
            type: q.type,
            options: q.options ?? undefined,
            isRequired: q.isRequired ?? true,
            order: q.order,
          })),
        },
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
  }

  async updateTemplate(templateId: string, userId: string, dto: CreateFeedbackTemplateDto) {
    const template = await this.prisma.feedbackFormTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Template not found');
    if (template.createdBy !== userId) {
      throw new ForbiddenException('You do not own this template');
    }

    // Replace questions entirely
    await this.prisma.feedbackQuestion.deleteMany({ where: { templateId } });

    return this.prisma.feedbackFormTemplate.update({
      where: { id: templateId },
      data: {
        name: dto.name,
        questions: {
          create: dto.questions.map((q) => ({
            label: q.label,
            type: q.type,
            options: q.options ?? undefined,
            isRequired: q.isRequired ?? true,
            order: q.order,
          })),
        },
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
  }

  async deleteTemplate(templateId: string, userId: string) {
    const template = await this.prisma.feedbackFormTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Template not found');
    if (template.createdBy !== userId) {
      throw new ForbiddenException('You do not own this template');
    }
    await this.prisma.feedbackFormTemplate.delete({ where: { id: templateId } });
    return { message: 'Template deleted successfully' };
  }

  async attachTemplateToEvent(templateId: string, eventId: string, userId: string) {
    const template = await this.prisma.feedbackFormTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Template not found');
    if (template.createdBy !== userId) {
      throw new ForbiddenException('You do not own this template');
    }

    // Detach any existing template for this event first
    await this.prisma.eventFeedbackTemplate.deleteMany({ where: { eventId } });

    return this.prisma.eventFeedbackTemplate.create({
      data: { eventId, templateId },
    });
  }

  // ─── Legacy: list all feedback (for admin table) ──────────────────────────

  async listFeedback() {
    return this.prisma.feedback.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        event: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Identity masking helpers ─────────────────────────────────────────────

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***.***';
    const masked = local[0] + '***';
    return `${masked}@${domain}`;
  }

  private maskName(fullName: string): string {
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  }

  private formatResponseForOrganizer(r: any) {
    return {
      id: r.id,
      createdAt: r.createdAt,
      event: r.event,
      attendee: {
        displayName: this.maskName(r.user.fullName),
        displayEmail: this.maskEmail(r.user.email),
      },
      answers: r.answers,
    };
  }

  private formatResponseForAdmin(r: any) {
    return {
      id: r.id,
      createdAt: r.createdAt,
      event: r.event,
      attendee: {
        displayName: r.user.fullName,
        displayEmail: r.user.email,
        userId: r.user.id,
      },
      answers: r.answers,
    };
  }
}
