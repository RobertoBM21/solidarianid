import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { NextFunction, Response } from 'express';
import { AuthRequest } from '../auth-request';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      if (isUUID(authHeader)) {
        req.authId = authHeader;
      } else {
        throw new BadRequestException(
          'Authorization header must be a valid UUID',
        );
      }
    }

    next();
  }
}
