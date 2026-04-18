import { Injectable } from '@nestjs/common';
import { GetUserMembershipsPort } from '../application/ports/get-user-memberships.port';
import { CommunitiesIntegrationService } from '../../communities/application/services/communities-integration.service';
import { UserMembershipHistoryItem } from '@app/shared/application/dtos/my-collaborations.dto';

@Injectable()
export class MyMembershipsIntegrationAdapter implements GetUserMembershipsPort {
  constructor(private readonly integrationApi: CommunitiesIntegrationService) {}

  getUserMemberships(userId: string): Promise<UserMembershipHistoryItem[]> {
    return this.integrationApi.getUserMemberships(userId);
  }
}
