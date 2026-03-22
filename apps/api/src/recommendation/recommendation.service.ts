import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly mlServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  }

  async getRecommendations(userId: string, n: number = 10) {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(`${this.mlServiceUrl}/predict/${userId}?n=${n}`),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get recommendations: ${error.message}`);
      if (error.response?.status === 503) {
        throw new HttpException(
          'Recommendation service unavailable. Models not trained yet.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException('Failed to get recommendations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getSimilarEvents(eventId: string, n: number = 10) {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(`${this.mlServiceUrl}/similar/${eventId}?n=${n}`),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get similar events: ${error.message}`);
      if (error.response?.status === 404) {
        throw new HttpException('Event not found in recommendation model', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to get similar events', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async retrain() {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(`${this.mlServiceUrl}/retrain`),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to trigger retrain: ${error.message}`);
      throw new HttpException('Failed to trigger model retrain', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getHealth() {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(`${this.mlServiceUrl}/health`),
      );
      return response.data;
    } catch (error: any) {
      return {
        status: 'unreachable',
        service: 'ml-recommendation',
        error: error.message,
      };
    }
  }
}
