import { Injectable } from '@nestjs/common';
import { CommunitiesIntegrationService } from '../../../communities/application/services/communities-integration.service';
import { CommunityAuthorizationPort } from '../../domain/ports/community-authz.port';

@Injectable()
export class CommunityAuthorizationAdapter
  implements CommunityAuthorizationPort
{
  constructor(private readonly integrationApi: CommunitiesIntegrationService) {}

  canManageCommunity(userId: string, communityId: string): Promise<boolean> {
    return this.integrationApi.isCommunityAdmin(userId, communityId);
  }
}
