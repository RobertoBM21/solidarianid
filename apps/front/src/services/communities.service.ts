import { gql } from '@apollo/client';
import apolloClient from '../lib/apollo/client';
import { fetchServer } from '../lib/http/fetch-server';
import type {
  CommunityDetail,
  CommunityListItem,
  CommunityMember,
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
  const { data } = await apolloClient.query<CommunitiesQueryResponse>({
    query: GET_COMMUNITIES,
    fetchPolicy: 'network-only',
  });

  return data?.communities ?? [];
}

export async function getLatestCommunities(): Promise<CommunityListItem[]> {
  const { data } = await apolloClient.query<CommunitiesQueryResponse>({
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
  const { data } = await apolloClient.query<CommunityQueryResponse>({
    query: GET_COMMUNITY,
    variables: { id },
    fetchPolicy: 'cache-first',
  });

  return data?.community ?? undefined;
}

export async function getCommunityMembers(
  communityId: string,
): Promise<CommunityMember[]> {
  const res = await fetchServer(`/communities/${communityId}/members`);

  if (!res.ok) return [];

  const data: unknown = await res.json();
  return data as CommunityMember[];
}

export async function createCommunityProposal(
  payload: CommunityProposalPayload,
  fetchFn: (endpoint: string, options?: RequestInit) => Promise<Response>,
): Promise<CommunityProposalResponse> {
  const response = await fetchFn('/communities', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data: unknown = await response.json();
  const proposalResponse = data as CommunityProposalResponse;

  if (!response.ok) {
    throw new Error(
      proposalResponse.message ?? 'No se pudo registrar la propuesta.',
    );
  }

  return proposalResponse;
}
