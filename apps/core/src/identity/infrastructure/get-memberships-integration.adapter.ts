import { Injectable } from '@nestjs/common';
import { CommunitiesIntegrationService } from '../../communities/application/services/communities-integration.service';
import { GetMembershipsPort } from '../application/ports/get-memberships.port';

@Injectable()
export class GetMembershipsIntegrationAdapter implements GetMembershipsPort {
  constructor(private readonly integrationApi: CommunitiesIntegrationService) {}

  getMemberships(userIds: string[]): Promise<Map<string, string[]>> {
    return this.integrationApi.getMemberships(userIds);
  }
}
