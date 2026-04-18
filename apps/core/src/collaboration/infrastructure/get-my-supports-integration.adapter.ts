import { Injectable } from '@nestjs/common';
import { GetMySupportsPort } from '../application/ports/get-my-supports.port';
import { InitiativesIntegrationService } from '../../initiatives/infrastructure/initiatives-integration.service';

@Injectable()
export class GetMySupportsIntegrationAdapter implements GetMySupportsPort {
  constructor(private readonly integrationApi: InitiativesIntegrationService) {}

  getMySupports(userId: string) {
    return this.integrationApi.getMySupports(userId);
  }
}
