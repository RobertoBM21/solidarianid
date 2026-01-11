import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(InternalServerErrorException)
export class InternalErrorFilter implements ExceptionFilter {
  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    res.status(500).render('error', {
      layout: false,
      error: exception.message,
    });
  }
}
