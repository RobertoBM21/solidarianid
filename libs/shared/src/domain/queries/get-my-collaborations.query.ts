import { DomainEvent } from '../event';

export interface UserHistoryItem {
  type: 'membership' | 'support' | 'donation' | 'volunteering';
  subject: string;
  causeId?: string;
  date: string;
}

export type UserMembershipHistoryItem = UserHistoryItem & {
  type: 'membership';
};

export type UserSupportHistoryItem = UserHistoryItem & {
  type: 'support';
};

export type UserDonationHistoryItem = UserHistoryItem & {
  type: 'donation';
  amount: number;
};

export type UserVolunteeringHistoryItem = UserHistoryItem & {
  type: 'volunteering';
  end: string;
};

export interface UserCollaborationHistory {
  items: UserHistoryItem[];
}

export class GetMyCollaborationsQuery extends DomainEvent {
  constructor(public readonly userId: string) {
    super();
  }
}
