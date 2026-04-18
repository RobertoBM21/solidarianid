import { Injectable } from '@nestjs/common';
import { InitiativesIntegrationService } from '../../initiatives/infrastructure/initiatives-integration.service';
import { GetMySupportsPort } from '../application/ports/get-my-supports.port';

@Injectable()
export class GetMySupportsAdapter implements GetMySupportsPort {
  constructor(private readonly integrationApi: InitiativesIntegrationService) {}

  getMySupports(userId: string) {
    return this.integrationApi.getMySupports(userId);
  }
}
