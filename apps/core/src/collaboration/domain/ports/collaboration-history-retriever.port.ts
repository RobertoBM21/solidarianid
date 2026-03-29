import {
  UserDonationHistoryItem,
  UserVolunteeringHistoryItem,
} from '@app/shared/domain/queries/get-my-collaborations.query';

export abstract class CollaborationHistoryRetrieverPort {
  abstract getUserDonations(userId: string): Promise<UserDonationHistoryItem[]>;
  abstract getUserVolunteering(
    userId: string,
  ): Promise<UserVolunteeringHistoryItem[]>;
}
