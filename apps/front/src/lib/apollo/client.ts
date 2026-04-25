import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client/core';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { Kind, OperationTypeNode } from 'graphql';
import { createClient } from 'graphql-ws';

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3010';

const GATEWAY_WS_URL = GATEWAY_URL.replace(/^http/, 'ws');

const httpLink = new HttpLink({
  uri: `${GATEWAY_URL}/graphql`,
});

const link =
  typeof window === 'undefined'
    ? httpLink
    : ApolloLink.split(
        ({ query }) => {
          const definition = getMainDefinition(query);

          return (
            definition.kind === Kind.OPERATION_DEFINITION &&
            definition.operation === OperationTypeNode.SUBSCRIPTION
          );
        },
        new GraphQLWsLink(
          createClient({
            url: `${GATEWAY_WS_URL}/graphql`,
          }),
        ),
        httpLink,
      );

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default apolloClient;
