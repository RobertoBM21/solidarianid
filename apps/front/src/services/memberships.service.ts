import { fetchServer } from '../lib/http/fetch-server';
import type { MembershipRequest } from '../models/community.models';

export async function getMyMemberships(): Promise<MembershipRequest[]> {
  const res = await fetchServer('/membership-requests/mine');

  if (!res.ok) return [];

  const data: unknown = await res.json();
  return data as MembershipRequest[];
}

export async function requestMembership(
  communityId: string,
  fetchFn: (endpoint: string, options?: RequestInit) => Promise<Response>,
): Promise<MembershipRequest> {
  const response = await fetchFn(
    `/communities/${encodeURIComponent(communityId)}/membership-requests`,
    { method: 'POST' },
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    const body = data as { message?: string };
    throw new Error(body.message ?? 'No se pudo solicitar la membresía.');
  }

  return data as MembershipRequest;
}

export async function leaveCommunity(
  communityId: string,
  fetchFn: (endpoint: string, options?: RequestInit) => Promise<Response>,
): Promise<void> {
  const response = await fetchFn(
    `/communities/${encodeURIComponent(communityId)}/leave`,
    { method: 'DELETE' },
  );

  if (!response.ok) {
    const data: unknown = await response.json();
    const body = data as { message?: string };
    throw new Error(body.message ?? 'No se pudo abandonar la comunidad.');
  }
}
