import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthRequest } from './auth-request';

export interface AuthIdOptions {
  optional?: boolean;
}

export const AuthId = createParamDecorator(
  (data: AuthIdOptions | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    const userId = request.authId;

    if (userId) {
      return userId;
    }

    if (data?.optional) {
      return undefined;
    }

    throw new InternalServerErrorException(
      'AuthId is missing! This route requires a user ID, but the request was processed without one.',
    );
  },
);
