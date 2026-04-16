import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import Redis from 'ioredis';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly mlServiceUrl: string;
  private readonly redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectQueue('recommendation') private readonly recommendationQueue: Queue,
  ) {
    this.mlServiceUrl = this.configService.get<string>('ML_SERVICE_URL', 'http://localhost:8000');
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });
  }

  async getRecommendations(userId: string, n: number = 10): Promise<any> {
    try {
      // 1. Check Redis Cache
      const cacheKey = `recommendations:user:${userId}:${n}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.log(`Serving recommendations from cache for user ${userId}`);
        return JSON.parse(cached);
      }

      // 2. Fetch from ML Service
      this.logger.log(`Fetching fresh recommendations from ML service for user ${userId}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${this.mlServiceUrl}/predict/${userId}?n=${n}`),
      );

      const mlData = response.data;
      const eventIds = mlData.recommendations.map((r: any) => r.event_id);

      // 3. Fetch full event details from Prisma
      const events = await this.prisma.event.findMany({
        where: { id: { in: eventIds } },
        include: {
          ...this.defaultIncludes(),
          _count: { select: { registrations: true } },
        },
      });

      // 4. Preserve ML ranking order
      const orderedEvents = eventIds
        .map((id: string) => events.find((e: any) => e.id === id))
        .filter(Boolean);

      // 5. Cache Result (1 hour TTL)
      await this.redis.set(cacheKey, JSON.stringify(orderedEvents), 'EX', 3600);

      return orderedEvents;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get recommendations: ${errorMessage}`);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 503) {
          throw new HttpException(
            'Recommendation service unavailable. Models not trained yet.',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
      }
      throw new HttpException('Failed to get recommendations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getSimilarEvents(eventId: string, n: number = 10): Promise<any> {
    try {
      // 1. Check Cache
      const cacheKey = `recommendations:similar:${eventId}:${n}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // 2. Fetch from ML Service
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${this.mlServiceUrl}/similar/${eventId}?n=${n}`),
      );

      const mlData = response.data;
      const eventIds = mlData.similar_events.map((r: any) => r.event_id);

      // 3. Fetch full event details from Prisma
      const events = await this.prisma.event.findMany({
        where: { id: { in: eventIds } },
        include: {
          ...this.defaultIncludes(),
          _count: { select: { registrations: true } },
        },
      });

      // 4. Preserve order
      const orderedEvents = eventIds
        .map((id: string) => events.find((e: any) => e.id === id))
        .filter(Boolean);

      // 5. Cache Result (24 hour TTL)
      await this.redis.set(cacheKey, JSON.stringify(orderedEvents), 'EX', 86400);

      return orderedEvents;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get similar events: ${errorMessage}`);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          throw new HttpException('Event not found in recommendation model', HttpStatus.NOT_FOUND);
        }
      }
      throw new HttpException('Failed to get similar events', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async retrain() {
    try {
      this.logger.log('Adding model retraining task to queue');

      // Dedicated JobId for deduplication: only one retrain job can be waiting/active
      const jobId = 'recommendation-retrain';

      const job = await this.recommendationQueue.add(
        'retrain',
        { timestamp: new Date().toISOString() },
        {
          jobId,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      return {
        status: 'queued',
        message: 'Model retraining has been scheduled in the background.',
        jobId: job.id,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to trigger retrain: ${errorMessage}`);
      throw new HttpException('Failed to trigger model retrain', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getJobStatus(jobId: string) {
    const job = await this.recommendationQueue.getJob(jobId);

    if (!job) {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }

    const state = await job.getState();
    const progress = job.progress;
    const failedReason = job.failedReason;
    const finishedOn = job.finishedOn;

    return {
      jobId: job.id,
      status: state,
      progress: progress,
      failedReason: failedReason,
      finishedOn: finishedOn ? new Date(finishedOn).toISOString() : null,
    };
  }

  async getHealth(): Promise<unknown> {
    try {
      const response: AxiosResponse<unknown> = await firstValueFrom(
        this.httpService.get(`${this.mlServiceUrl}/health`),
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        status: 'unreachable',
        service: 'ml-recommendation',
        error: errorMessage,
      };
    }
  }
  private defaultIncludes() {
    return {
      status: true,
      eventType: true,
      venue: true,
      tags: { include: { tag: true } },
      eventCategories: { include: { category: true } },
      media: true,
      sessions: {
        include: {
          speakers: { include: { speaker: true } },
        },
        orderBy: { startTime: 'asc' as const },
      },
    };
  }
}
