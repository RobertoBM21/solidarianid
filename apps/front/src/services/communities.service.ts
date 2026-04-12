import { gql } from '@apollo/client';
import apolloClient from '../lib/apollo/client';
import type {
  CommunityDetail,
  CommunityListItem,
  CommunityMember,
} from '../models/community.models';

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3010';
const REQUESTER_ID =
  process.env.NEXT_PUBLIC_COMMUNITY_PROPOSAL_USER_ID ??
  '20000000-0000-4000-8000-000000000001';

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

const communityMembersByCommunityId: Record<string, CommunityMember[]> = {
  '40000000-0000-4000-8000-000000000001': [
    {
      id: '60000000-0000-4000-8000-000000000001',
      communityId: '40000000-0000-4000-8000-000000000001',
      userId: '20000000-0000-4000-8000-000000000001',
      role: 'admin',
    },
    {
      id: '60000000-0000-4000-8000-000000000002',
      communityId: '40000000-0000-4000-8000-000000000001',
      userId: '20000000-0000-4000-8000-000000000006',
      role: 'member',
    },
    {
      id: '60000000-0000-4000-8000-000000000003',
      communityId: '40000000-0000-4000-8000-000000000001',
      userId: '20000000-0000-4000-8000-000000000007',
      role: 'member',
    },
  ],
  '40000000-0000-4000-8000-000000000002': [
    {
      id: '60000000-0000-4000-8000-000000000004',
      communityId: '40000000-0000-4000-8000-000000000002',
      userId: '20000000-0000-4000-8000-000000000002',
      role: 'admin',
    },
    {
      id: '60000000-0000-4000-8000-000000000005',
      communityId: '40000000-0000-4000-8000-000000000002',
      userId: '20000000-0000-4000-8000-000000000003',
      role: 'member',
    },
  ],
  '40000000-0000-4000-8000-000000000003': [
    {
      id: '60000000-0000-4000-8000-000000000006',
      communityId: '40000000-0000-4000-8000-000000000003',
      userId: '20000000-0000-4000-8000-000000000004',
      role: 'admin',
    },
    {
      id: '60000000-0000-4000-8000-000000000007',
      communityId: '40000000-0000-4000-8000-000000000003',
      userId: '20000000-0000-4000-8000-000000000005',
      role: 'member',
    },
  ],
  '40000000-0000-4000-8000-000000000004': [
    {
      id: '60000000-0000-4000-8000-000000000008',
      communityId: '40000000-0000-4000-8000-000000000004',
      userId: '20000000-0000-4000-8000-000000000008',
      role: 'admin',
    },
    {
      id: '60000000-0000-4000-8000-000000000009',
      communityId: '40000000-0000-4000-8000-000000000004',
      userId: '20000000-0000-4000-8000-000000000009',
      role: 'member',
    },
  ],
};

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
  return Promise.resolve(communityMembersByCommunityId[communityId] ?? []);
}

export async function createCommunityProposal(
  payload: CommunityProposalPayload,
): Promise<CommunityProposalResponse> {
  const response = await fetch(`${GATEWAY_URL}/communities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: REQUESTER_ID,
    },
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
