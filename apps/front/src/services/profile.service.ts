import { fetchServer } from '../lib/http/fetch-server';
import type {
  HistoryItem,
  ProfileMembershipItem,
  ProfileMembershipRequestItem,
  ProfileMembershipRequestStatus,
  ProfileProposal,
  ProfileView,
} from '../models/profile.models';
import { getMyCollaborations } from './collaboration-history.service';
import { getCommunities } from './communities.service';
import { getMyMembershipRequests } from './memberships.service';

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

interface ProfileMembershipEntry {
  id: string;
  communityId: string;
  communityName: string;
  status: 'accepted' | 'pending' | 'rejected';
}

function isMembershipRequestEntry(
  entry: ProfileMembershipEntry,
): entry is ProfileMembershipEntry & {
  status: ProfileMembershipRequestStatus;
} {
  return entry.status === 'pending' || entry.status === 'rejected';
}

export async function getProfileView(sessionUser: {
  id: string;
  email: string;
}): Promise<ProfileView> {
  const [profileRes, membershipEntries, communities, proposalsRes] =
    await Promise.all([
      fetchServer('/profile'),
      getMyMembershipRequests(),
      getCommunities(),
      fetchServer('/my-proposals'),
    ]);

  const communityNames = new Map(communities.map((c) => [c.id, c.name]));

  const mappedEntries: ProfileMembershipEntry[] = membershipEntries.map(
    (entry) => ({
      id: entry.id,
      communityId: entry.communityId,
      communityName:
        communityNames.get(entry.communityId) ?? 'Comunidad no disponible',
      status: entry.status,
    }),
  );

  const memberships: ProfileMembershipItem[] = mappedEntries
    .filter((entry) => entry.status === 'accepted')
    .map(({ id, communityId, communityName }) => ({
      id,
      communityId,
      communityName,
    }));

  const membershipRequests: ProfileMembershipRequestItem[] = mappedEntries
    .filter(isMembershipRequestEntry)
    .map(({ id, communityId, communityName, status }) => ({
      id,
      communityId,
      communityName,
      status,
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
    memberships,
    membershipRequests,
    proposals,
  };
}

export async function getProfileHistory(): Promise<HistoryItem[]> {
  try {
    return await getMyCollaborations(fetchServer);
  } catch {
    return [];
  }
}
