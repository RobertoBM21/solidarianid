import { fetchServer } from '../lib/http/fetch-server';
import type {
  CommunityMember,
  MembershipRequest,
} from '../models/community.models';

type FetchFn = (endpoint: string, options?: RequestInit) => Promise<Response>;

type MembershipRequestVerdict = 'accepted' | 'rejected';

function getErrorMessage(data: unknown, fallback: string): string {
  const body = data as { message?: string };
  return body.message ?? fallback;
}

export async function getMyMembershipRequests(): Promise<MembershipRequest[]> {
  const response = await fetchServer('/membership-requests/mine');

  if (!response.ok) return [];

  const data: unknown = await response.json();
  return data as MembershipRequest[];
}

export async function requestMembership(
  communityId: string,
  fetchFn: FetchFn,
): Promise<MembershipRequest> {
  const response = await fetchFn(
    `/communities/${encodeURIComponent(communityId)}/membership-requests`,
    { method: 'POST' },
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, 'No se pudo solicitar la membresía.'),
    );
  }

  return data as MembershipRequest;
}

export async function getCommunityMembershipRequests(
  communityId: string,
  fetchFn: FetchFn = fetchServer,
): Promise<MembershipRequest[]> {
  const response = await fetchFn(
    `/communities/${encodeURIComponent(communityId)}/membership-requests`,
  );

  if (!response.ok) return [];

  const data: unknown = await response.json();
  return data as MembershipRequest[];
}

export async function reviewMembershipRequest(
  requestId: string,
  verdict: MembershipRequestVerdict,
  fetchFn: FetchFn,
): Promise<MembershipRequest> {
  const response = await fetchFn(
    `/membership-requests/${encodeURIComponent(requestId)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ verdict }),
    },
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, 'No se pudo revisar la solicitud de membresía.'),
    );
  }

  return data as MembershipRequest;
}

export async function getCommunityMembers(
  communityId: string,
  fetchFn: FetchFn = fetchServer,
): Promise<CommunityMember[]> {
  const response = await fetchFn(
    `/communities/${encodeURIComponent(communityId)}/members`,
  );

  if (!response.ok) return [];

  const data: unknown = await response.json();
  return data as CommunityMember[];
}

export async function promoteCommunityMember(
  memberId: string,
  fetchFn: FetchFn,
): Promise<CommunityMember> {
  const response = await fetchFn(
    `/community-members/${encodeURIComponent(memberId)}/promote`,
    { method: 'POST' },
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, 'No se pudo promocionar al miembro.'),
    );
  }

  return data as CommunityMember;
}

export async function expelCommunityMember(
  memberId: string,
  fetchFn: FetchFn,
): Promise<void> {
  const response = await fetchFn(
    `/community-members/${encodeURIComponent(memberId)}`,
    { method: 'DELETE' },
  );

  if (!response.ok) {
    const data: unknown = await response.json();
    throw new Error(getErrorMessage(data, 'No se pudo expulsar al miembro.'));
  }
}

export async function leaveCommunity(
  communityId: string,
  fetchFn: FetchFn,
): Promise<void> {
  const response = await fetchFn(
    `/communities/${encodeURIComponent(communityId)}/leave`,
    { method: 'DELETE' },
  );

  if (!response.ok) {
    const data: unknown = await response.json();
    throw new Error(
      getErrorMessage(data, 'No se pudo abandonar la comunidad.'),
    );
  }
}
