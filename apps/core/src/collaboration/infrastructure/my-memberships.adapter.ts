import { UserMembershipHistoryItem } from '@app/shared/application/dtos/my-collaborations.dto';
import { Injectable } from '@nestjs/common';
import { CommunitiesIntegrationService } from '../../communities/application/services/communities-integration.service';
import { GetUserMembershipsPort } from '../application/ports/get-user-memberships.port';

@Injectable()
export class MyMembershipsAdapter implements GetUserMembershipsPort {
  constructor(private readonly integrationApi: CommunitiesIntegrationService) {}

  getUserMemberships(userId: string): Promise<UserMembershipHistoryItem[]> {
    return this.integrationApi.getUserMemberships(userId);
  }
}
