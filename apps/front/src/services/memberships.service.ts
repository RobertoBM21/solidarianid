import type { ApiClient } from '../lib/http/api-client';
import type {
  CommunityMember,
  MembershipRequest,
} from '../models/community.models';

type MembershipRequestVerdict = 'accepted' | 'rejected';

export async function getMyMembershipRequests(
  client: ApiClient,
): Promise<MembershipRequest[]> {
  const response = await client.get('/membership-requests/mine');

  if (!response.ok) return [];

  const data: unknown = await response.json();
  return data as MembershipRequest[];
}

export async function requestMembership(
  communityId: string,
  client: ApiClient,
): Promise<MembershipRequest> {
  const response = await client.post(
    `/communities/${encodeURIComponent(communityId)}/membership-requests`,
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      client.parseErrorMessage(data, 'No se pudo solicitar la membresía.'),
    );
  }

  return data as MembershipRequest;
}

export async function getCommunityMembershipRequests(
  communityId: string,
  client: ApiClient,
): Promise<MembershipRequest[]> {
  const response = await client.get(
    `/communities/${encodeURIComponent(communityId)}/membership-requests`,
  );

  if (!response.ok) return [];

  const data: unknown = await response.json();
  return data as MembershipRequest[];
}

export async function reviewMembershipRequest(
  requestId: string,
  verdict: MembershipRequestVerdict,
  client: ApiClient,
): Promise<MembershipRequest> {
  const response = await client.put(
    `/membership-requests/${encodeURIComponent(requestId)}`,
    { verdict },
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      client.parseErrorMessage(
        data,
        'No se pudo revisar la solicitud de membresía.',
      ),
    );
  }

  return data as MembershipRequest;
}

export async function getCommunityMembers(
  communityId: string,
  client: ApiClient,
): Promise<CommunityMember[]> {
  const response = await client.get(
    `/communities/${encodeURIComponent(communityId)}/members`,
  );

  if (!response.ok) return [];

  const data: unknown = await response.json();
  return data as CommunityMember[];
}

export async function promoteCommunityMember(
  memberId: string,
  client: ApiClient,
): Promise<CommunityMember> {
  const response = await client.post(
    `/community-members/${encodeURIComponent(memberId)}/promote`,
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      client.parseErrorMessage(data, 'No se pudo promocionar al miembro.'),
    );
  }

  return data as CommunityMember;
}

export async function expelCommunityMember(
  memberId: string,
  client: ApiClient,
): Promise<void> {
  const response = await client.delete(
    `/community-members/${encodeURIComponent(memberId)}`,
  );

  if (!response.ok) {
    const data: unknown = await response.json();
    throw new Error(
      client.parseErrorMessage(data, 'No se pudo expulsar al miembro.'),
    );
  }
}

export async function leaveCommunity(
  communityId: string,
  client: ApiClient,
): Promise<void> {
  const response = await client.delete(
    `/communities/${encodeURIComponent(communityId)}/leave`,
  );

  if (!response.ok) {
    const data: unknown = await response.json();
    throw new Error(
      client.parseErrorMessage(data, 'No se pudo abandonar la comunidad.'),
    );
  }
}
