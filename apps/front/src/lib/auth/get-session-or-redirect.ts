import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth-options';

export async function getSessionOrRedirect(): Promise<Session> {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return session;
}
