import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log to file for debugging
    const logMsg = `[${new Date().toISOString()}] ${request.method} ${request.url} - ${JSON.stringify(exception)}\n`;
    fs.appendFileSync('/tmp/api_error.log', logMsg);

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    console.log('[HttpExceptionFilter] Status:', status, 'Message:', JSON.stringify(message));
    if (status === 401) {
      console.log('[HttpExceptionFilter] Unauthorized details:', exception);
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message || message,
      error: typeof message === 'object' ? (message as any).error || null : null,
    };

    response.status(status).json(responseBody);
  }
}
