import {
  UserDonationHistoryItem,
  UserVolunteeringHistoryItem,
} from '@app/shared/application/dtos/my-collaborations.dto';
import { Injectable } from '@nestjs/common';
import { FundingIntegrationService } from '../../../funding/infrastructure/funding-integration.service';
import { VolunteeringIntegrationService } from '../../../volunteering/infrastructure/volunteering-integration.service';
import { CollaborationHistoryRetrieverPort } from '../../domain/ports/collaboration-history-retriever.port';

@Injectable()
export class CollaborationHistoryRetrieverAdapter
  implements CollaborationHistoryRetrieverPort
{
  constructor(
    private readonly fundingIntegration: FundingIntegrationService,
    private readonly volunteeringIntegration: VolunteeringIntegrationService,
  ) {}

  getUserDonations(userId: string): Promise<UserDonationHistoryItem[]> {
    return this.fundingIntegration.getUserDonations(userId);
  }

  getUserVolunteering(userId: string): Promise<UserVolunteeringHistoryItem[]> {
    return this.volunteeringIntegration.getUserVolunteering(userId);
  }
}
