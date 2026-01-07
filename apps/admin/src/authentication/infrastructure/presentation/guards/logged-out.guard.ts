import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class LoggedOutGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if ('userId' in req.session) {
      const res = context.switchToHttp().getResponse<Response>();
      res.redirect('/');
      return false;
    }

    return true;
  }
}
