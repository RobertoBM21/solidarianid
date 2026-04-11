export type ProfileMembershipStatus =
  | 'admin'
  | 'member'
  | 'accepted'
  | 'pending'
  | 'rejected';

export interface ProfileMembershipItem {
  id: string;
  communityId: string;
  communityName: string;
  status: ProfileMembershipStatus;
}

export interface ProfileProposal {
  id: string;
  title: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ProfileView {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  memberships: ProfileMembershipItem[];
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
