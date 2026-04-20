import { fetchServer } from '../lib/http/fetch-server';
import type {
  HistoryItem,
  ProfileProposal,
  ProfileView,
} from '../models/profile.models';
import { getCommunities } from './communities.service';
import { getMyMemberships } from './memberships.service';

interface ProfileResponse {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
}

interface ProposalResponse {
  id: string;
  name: string;
  description: string;
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
  const [profileRes, memberships, communities, proposalsRes] =
    await Promise.all([
      fetchServer('/profile'),
      getMyMemberships(),
      getCommunities(),
      fetchServer('/my-proposals'),
    ]);

  const communityNames = new Map(communities.map((c) => [c.id, c.name]));

  const mappedMemberships = memberships.map((req) => ({
    id: req.id,
    communityId: req.communityId,
    communityName: communityNames.get(req.communityId) ?? req.communityId,
    status: req.status as ProfileView['memberships'][number]['status'],
  }));

  let proposals: ProfileProposal[] = [];
  if (proposalsRes.ok) {
    const data: unknown = await proposalsRes.json();
    const items = data as ProposalResponse[];
    proposals = items.map((p) => ({
      id: p.id,
      title: p.name,
      status: p.status,
    }));
  }

  let profile: ProfileResponse = {
    id: sessionUser.id,
    email: sessionUser.email,
  };
  if (profileRes.ok) {
    const data: unknown = await profileRes.json();
    profile = data as ProfileResponse;
  }

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    city: profile.city,
    country: profile.country,
    memberships: mappedMemberships,
    proposals,
  };
}

export async function getProfileHistory(): Promise<HistoryItem[]> {
  const res = await fetchServer('/my-collaborations');

  if (!res.ok) return [];

  const data: unknown = await res.json();
  const body = data as CollaborationsResponse;
  return body.items;
}
