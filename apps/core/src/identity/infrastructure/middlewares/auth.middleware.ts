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
    const userIdHeader = req.headers['x-user-id'];

    if (typeof userIdHeader === 'string' && userIdHeader) {
      if (isUUID(userIdHeader)) {
        req.authId = userIdHeader;
      } else {
        throw new BadRequestException('x-user-id header must be a valid UUID');
      }
    }

    next();
  }
}
