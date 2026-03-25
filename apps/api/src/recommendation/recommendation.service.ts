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

  async getRecommendations(userId: string, n: number = 10) {
    const cacheKey = `recommendations:${userId}:${n}`;

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
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(`${this.mlServiceUrl}/predict/${userId}?n=${n}`),
      );

      // 3. Cache Result (1 hour TTL)
      await this.redis.set(cacheKey, JSON.stringify(response.data), 'EX', 3600);

      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get recommendations: ${errorMessage}`);
      const axiosError = error as any;
      if (axiosError.response?.status === 503) {
        throw new HttpException(
          'Recommendation service unavailable. Models not trained yet.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException('Failed to get recommendations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getSimilarEvents(eventId: string, n: number = 10) {
    const cacheKey = `similar_events:${eventId}:${n}`;

    try {
      // 1. Check Cache
      const cacheKey = `recommendations:similar:${eventId}:${n}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // 2. Fetch from ML Service
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(`${this.mlServiceUrl}/similar/${eventId}?n=${n}`),
      );

      // 3. Cache Result (24 hour TTL for similar events as they change less frequently)
      await this.redis.set(cacheKey, JSON.stringify(response.data), 'EX', 86400);

      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get similar events: ${errorMessage}`);
      const axiosError = error as any;
      if (axiosError.response?.status === 404) {
        throw new HttpException('Event not found in recommendation model', HttpStatus.NOT_FOUND);
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

  async getHealth() {
    try {
      const response: AxiosResponse = await firstValueFrom(
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
}
