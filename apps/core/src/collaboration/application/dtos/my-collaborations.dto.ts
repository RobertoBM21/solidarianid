import {
  UserCollaborationHistory,
  UserDonationHistoryItem,
  UserHistoryItem,
  UserMembershipHistoryItem,
  UserSupportHistoryItem,
  UserVolunteeringHistoryItem,
} from '@app/shared/domain/queries/get-my-collaborations.query';

export abstract class UserHistoryItemDto implements UserHistoryItem {
  /**
   * The type of collaboration: 'membership', 'support', 'donation', or 'volunteering'.
   */
  abstract readonly type:
    | 'membership'
    | 'support'
    | 'donation'
    | 'volunteering';

  /**
   * The subject or title of the collaboration.
   */
  readonly subject: string;

  /**
   * The ID of the cause associated with the collaboration.
   */
  readonly causeId?: string;

  /**
   * The date when the collaboration was created (ISO 8601 string).
   */
  readonly date: string;

  constructor(subject: string, causeId: string | undefined, createdAt: Date) {
    this.subject = subject;
    this.causeId = causeId;
    this.date = createdAt.toISOString();
  }
}

export class UserMembershipHistoryItemDto
  extends UserHistoryItemDto
  implements UserMembershipHistoryItem
{
  type = 'membership' as const;
}

export class UserSupportHistoryItemDto
  extends UserHistoryItemDto
  implements UserSupportHistoryItem
{
  type = 'support' as const;
}

export class UserDonationHistoryItemDto
  extends UserHistoryItemDto
  implements UserDonationHistoryItem
{
  type = 'donation' as const;

  /**
   * The amount donated by the user.
   */
  readonly amount: number;

  constructor(
    subject: string,
    causeId: string,
    createdAt: Date,
    amount: number,
  ) {
    super(subject, causeId, createdAt);
    this.amount = amount;
  }
}

export class UserVolunteeringHistoryItemDto
  extends UserHistoryItemDto
  implements UserVolunteeringHistoryItem
{
  type = 'volunteering' as const;

  /**
   * The end date of the volunteering activity (ISO 8601 string).
   */
  readonly end: string;

  constructor(subject: string, causeId: string, start: Date, end: Date) {
    super(subject, causeId, start);
    this.end = end.toISOString();
  }
}

export class MyCollaborationsDto implements UserCollaborationHistory {
  readonly items: UserHistoryItemDto[];

  constructor(
    memberships: UserMembershipHistoryItemDto[],
    supports: UserSupportHistoryItemDto[],
    donations: UserDonationHistoryItemDto[],
    volunteering: UserVolunteeringHistoryItemDto[],
    order: 'ASC' | 'DESC',
  ) {
    const orderFactor = order === 'ASC' ? 1 : -1;
    this.items = [
      ...memberships,
      ...supports,
      ...donations,
      ...volunteering,
    ].sort((a, b) => a.date.localeCompare(b.date) * orderFactor);
  }
}
