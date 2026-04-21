export interface ProfileMembershipItem {
  id: string;
  communityId: string;
  communityName: string;
}

export type ProfileMembershipRequestStatus = 'pending' | 'rejected';

export interface ProfileMembershipRequestItem {
  id: string;
  communityId: string;
  communityName: string;
  status: ProfileMembershipRequestStatus;
}

export interface ProfileProposal {
  id: string;
  title: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ProfileView {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  memberships: ProfileMembershipItem[];
  membershipRequests: ProfileMembershipRequestItem[];
  proposals: ProfileProposal[];
}

export interface HistoryItem {
  type: 'membership' | 'support' | 'donation' | 'volunteering';
  subject: string;
  causeId?: string;
  date: string;
  amount?: number;
  end?: string;
}
