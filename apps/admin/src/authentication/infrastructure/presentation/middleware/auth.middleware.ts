import { NextFunction, Request, Response } from 'express';
import { AdminSession } from '../../../../presentation/session-data';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = req.session as AdminSession;
  res.locals.userId = session.userId;
  next();
}
