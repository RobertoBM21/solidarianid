import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core';
import { getServerSession } from 'next-auth';
import { cache } from 'react';
import { authOptions } from '../auth/auth-options';

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3010';

const getApolloClientByAccessToken = cache((accessToken?: string) => {
  return new ApolloClient({
    link: new HttpLink({
      uri: `${GATEWAY_URL}/graphql`,
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    }),
    cache: new InMemoryCache(),
  });
});

export async function getServerApolloClient() {
  const session = await getServerSession(authOptions);
  return getApolloClientByAccessToken(session?.accessToken);
}
