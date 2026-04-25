import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthRequest } from './auth-request';

export interface GqlAuthIdOptions {
  optional?: boolean;
}

export const GqlAuthId = createParamDecorator(
  (data: GqlAuthIdOptions | undefined, ctx: ExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    const request = gqlCtx.getContext<{ req: AuthRequest }>().req;
    const userId = request.authId;

    if (userId) {
      return userId;
    }

    if (data?.optional) {
      return undefined;
    }

    throw new InternalServerErrorException(
      'GqlAuthId is missing! This resolver requires a user ID, but the request was processed without one.',
    );
  },
);
