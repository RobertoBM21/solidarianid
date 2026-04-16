import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const protectedPaths = ['/profile', '/communities/create'];

function isProtectedPath(pathname: string): boolean {
  if (
    protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))
  ) {
    return true;
  }
  // /communities/:id/management
  if (/^\/communities\/[^/]+\/management/.test(pathname)) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/communities/create',
    '/communities/:id/management/:path*',
  ],
};
