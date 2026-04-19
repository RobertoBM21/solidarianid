import {
  UserDonationHistoryItem,
  UserVolunteeringHistoryItem,
} from '@app/shared/application/dtos/my-collaborations.dto';

export abstract class CollaborationHistoryRetrieverPort {
  abstract getUserDonations(userId: string): Promise<UserDonationHistoryItem[]>;
  abstract getUserVolunteering(
    userId: string,
  ): Promise<UserVolunteeringHistoryItem[]>;
}
