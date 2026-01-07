import { Session } from 'express-session';

export interface AdminSession extends Session {
  userId?: string;
}
