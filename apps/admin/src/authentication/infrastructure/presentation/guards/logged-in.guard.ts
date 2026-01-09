import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class LoggedInGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    if ('userId' in req.session) {
      return true;
    }

    const res = context.switchToHttp().getResponse<Response>();
    res.redirect('/auth/login');
    return false;
  }
}
