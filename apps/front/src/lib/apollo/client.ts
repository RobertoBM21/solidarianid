import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3010';

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: `${GATEWAY_URL}/graphql`,
  }),
  cache: new InMemoryCache(),
});

export default apolloClient;
