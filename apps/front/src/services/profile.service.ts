import { fetchServer } from '../lib/http/fetch-server';
import type { HistoryItem, ProfileView } from '../models/profile.models';
import { getCommunities } from './communities.service';

interface MembershipRequestResponse {
  id: string;
  userId: string;
  communityId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface CollaborationsResponse {
  items: HistoryItem[];
}

export async function getProfileView(sessionUser: {
  id: string;
  email: string;
}): Promise<ProfileView> {
  const [requestsRes, communities] = await Promise.all([
    fetchServer('/membership-requests/mine'),
    getCommunities(),
  ]);

  const communityNames = new Map(communities.map((c) => [c.id, c.name]));

  let memberships: ProfileView['memberships'] = [];
  if (requestsRes.ok) {
    const data: unknown = await requestsRes.json();
    const requests = data as MembershipRequestResponse[];
    memberships = requests.map((req) => ({
      id: req.id,
      communityId: req.communityId,
      communityName: communityNames.get(req.communityId) ?? req.communityId,
      status: req.status,
    }));
  }

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    memberships,
    proposals: [],
  };
}

export async function getProfileHistory(): Promise<HistoryItem[]> {
  const res = await fetchServer('/my-collaborations');

  if (!res.ok) return [];

  const data: unknown = await res.json();
  const body = data as CollaborationsResponse;
  return body.items;
}
