import { Injectable } from '@nestjs/common';
import { CommunitiesIntegrationService } from '../../../communities/application/services/communities-integration.service';
import { CauseData } from '../../application/dtos/cause.dto';
import { CauseDataGetterPort } from '../../application/ports/cause-data-getter.port';

@Injectable()
export class CauseDataGetterAdapter implements CauseDataGetterPort {
  constructor(private readonly integrationApi: CommunitiesIntegrationService) {}

  getCauseData(
    communityId: string,
    causeId: string,
  ): Promise<CauseData | null> {
    return this.integrationApi.getCauseData(communityId, causeId);
  }
}
