import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthRequest } from '../auth-request';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext<{ req: AuthRequest }>().req;

    if (!request.authId) {
      throw new UnauthorizedException(
        'Authorization header must be a valid UUID',
      );
    }

    return true;
  }
}
