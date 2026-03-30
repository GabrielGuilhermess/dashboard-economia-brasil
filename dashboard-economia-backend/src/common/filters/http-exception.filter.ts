import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (status === HttpStatus.SERVICE_UNAVAILABLE) {
        const message = this.getMessage(exceptionResponse, exception.message);
        console.error(exception);
        response.status(status).json({
          error: message,
          retryAfter: 60,
        });
        return;
      }

      if (status === HttpStatus.BAD_REQUEST) {
        const message = this.getMessage(exceptionResponse, exception.message);
        console.error(exception);
        response.status(status).json({
          error: message,
        });
        return;
      }

      console.error(exception);
      response.status(status).json(exceptionResponse);
      return;
    }

    console.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }

  private getMessage(
    payload: string | object,
    fallback: string,
  ): string {
    if (typeof payload === 'string') {
      return payload;
    }

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload
    ) {
      const message = payload.message;

      if (typeof message === 'string') {
        return message;
      }

      if (Array.isArray(message) && typeof message[0] === 'string') {
        return message[0];
      }
    }

    return fallback;
  }
}
