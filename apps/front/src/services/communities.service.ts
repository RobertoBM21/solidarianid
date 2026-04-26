import { gql } from '@apollo/client/core';
import { getServerApolloClient } from '../lib/apollo/server-client';
import type { ApiClient } from '../lib/http/api-client';
import type {
  CommunityDetail,
  CommunityListItem,
} from '../models/community.models';

interface CommunitiesQueryResponse {
  communities: CommunityListItem[];
}

interface CommunityQueryResponse {
  community: CommunityDetail | null;
}

interface CommunityProposalPayload {
  name: string;
  description: string;
}

interface CommunityProposalResponse {
  proposalId?: string;
  message?: string;
}

const GET_COMMUNITIES = gql`
  query GetCommunities(
    $search: String
    $sortField: String
    $sortOrder: String
  ) {
    communities(search: $search, sortField: $sortField, sortOrder: $sortOrder) {
      id
      name
      description
      createdAt
    }
  }
`;

const GET_COMMUNITY = gql`
  query GetCommunity($id: String!) {
    community(id: $id) {
      id
      name
      description
      createdAt
      isCommunityAdmin
      causes {
        id
        title
        description
        duration
        ods
        closed: status
        createdAt
      }
    }
  }
`;

export async function getCommunities(): Promise<CommunityListItem[]> {
  const client = await getServerApolloClient();
  const { data } = await client.query<CommunitiesQueryResponse>({
    query: GET_COMMUNITIES,
    fetchPolicy: 'network-only',
  });

  return data?.communities ?? [];
}

export async function getLatestCommunities(): Promise<CommunityListItem[]> {
  const client = await getServerApolloClient();
  const { data } = await client.query<CommunitiesQueryResponse>({
    query: GET_COMMUNITIES,
    variables: {
      sortField: 'createdAt',
      sortOrder: 'DESC',
    },
    fetchPolicy: 'network-only',
  });

  return (data?.communities ?? []).slice(0, 5);
}

export async function getCommunityById(
  id: string,
): Promise<CommunityDetail | undefined> {
  const serverApolloClient = await getServerApolloClient();
  const { data } = await serverApolloClient.query<CommunityQueryResponse>({
    query: GET_COMMUNITY,
    variables: { id },
    fetchPolicy: 'cache-first',
  });

  return data?.community ?? undefined;
}

export async function createCommunityProposal(
  payload: CommunityProposalPayload,
  client: ApiClient,
): Promise<CommunityProposalResponse> {
  const response = await client.post('/communities', payload);

  const data: unknown = await response.json();
  const proposalResponse = data as CommunityProposalResponse;

  if (!response.ok) {
    throw new Error(
      proposalResponse.message ?? 'No se pudo registrar la propuesta.',
    );
  }

  return proposalResponse;
}
