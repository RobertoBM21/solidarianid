export interface CommunityListItem {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface CommunityCauseSummary {
  id: string;
  title: string;
  description: string;
  duration: string;
  ods: number;
  closed: boolean;
  createdAt: string;
}

export interface CommunityDetail {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  isCommunityAdmin?: boolean;
  causes: CommunityCauseSummary[];
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: 'member' | 'admin';
}

export interface MembershipRequest {
  id: string;
  userId: string;
  communityId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
