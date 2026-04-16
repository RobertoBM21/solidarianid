import jwt from 'jsonwebtoken';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3010';

function decodeJwtPayload(token: string): { sub: string; email: string } {
  const payload = jwt.decode(token);
  if (!payload || typeof payload === 'string') {
    throw new Error('Invalid JWT token');
  }
  return payload as { sub: string; email: string };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const res = await fetch(`${GATEWAY_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) return null;

        const data = (await res.json()) as { access_token: string };
        const payload = decodeJwtPayload(data.access_token);

        return {
          id: payload.sub,
          email: payload.email,
          accessToken: data.access_token,
        };
      },
    }),
    CredentialsProvider({
      id: 'token',
      name: 'Token',
      credentials: {
        token: { label: 'Token', type: 'text' },
      },
      authorize(credentials) {
        if (!credentials?.token) return null;

        const payload = decodeJwtPayload(credentials.token);

        return {
          id: payload.sub,
          email: payload.email,
          accessToken: credentials.token,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      const authUser = user as { accessToken?: string } | undefined;
      if (authUser?.accessToken) {
        token.accessToken = authUser.accessToken;
        token.userId = user.id;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken ?? '';
      session.user = {
        ...session.user,
        id: token.userId ?? '',
        email: token.email ?? '',
      };
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};
