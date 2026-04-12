import { Injectable } from '@nestjs/common';
import { CommunitiesIntegrationService } from '../../communities/application/services/communities-integration.service';
import { CauseData } from '../application/dtos/cause.dto';
import { CauseDataGetterPort } from '../application/ports/cause-data-getter.port';
import { CommunityAuthorizationPort } from '../domain/ports/community-authz.port';

@Injectable()
export class CommunitiesIntegrationAdapter
  implements CommunityAuthorizationPort, CauseDataGetterPort
{
  constructor(private readonly integrationApi: CommunitiesIntegrationService) {}

  canManageCommunity(userId: string, communityId: string): Promise<boolean> {
    return this.integrationApi.isCommunityAdmin(userId, communityId);
  }

  getCauseData(
    communityId: string,
    causeId: string,
  ): Promise<CauseData | null> {
    return this.integrationApi.getCauseData(communityId, causeId);
  }
}
