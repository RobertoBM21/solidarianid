'use client';

import { ApolloProvider } from '@apollo/client/react';
import apolloClient from '../../lib/apollo/client';

interface AppApolloProviderProps {
  children: React.ReactNode;
}

export default function AppApolloProvider({
  children,
}: AppApolloProviderProps) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
