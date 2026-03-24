import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import Redis from 'ioredis';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly mlServiceUrl: string;
  private readonly redis: Redis;

  constructor(
    private readonly httpService: HttpService,
    @InjectQueue('recommendation') private readonly recommendationQueue: Queue,
  ) {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });
  }

  async getRecommendations(userId: string, n: number = 10) {
    const cacheKey = `recommendations:${userId}:${n}`;

    try {
      // 1. Try to get from cache
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        this.logger.log(`Serving recommendations from cache for user: ${userId}`);
        return JSON.parse(cachedData);
      }

      // 2. If not in cache, fetch from ML service
      this.logger.log(`Fetching fresh recommendations from ML service for user: ${userId}`);
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(`${this.mlServiceUrl}/predict/${userId}?n=${n}`),
      );

      // 3. Save to cache (TTL: 1 hour)
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
      // Cache check
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(`${this.mlServiceUrl}/similar/${eventId}?n=${n}`),
      );

      // Cache for 24 hours (event similarity changes less often)
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
      const job = await this.recommendationQueue.add('retrain', {
        timestamp: new Date().toISOString(),
      });

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
