import { Injectable } from '@nestjs/common';
import { InitiativesStatisticsPort } from '../domain/ports/initiatives-statistics.port';

@Injectable()
export class InitiativesIntegrationService {
  constructor(private readonly statisticsPort: InitiativesStatisticsPort) {}

  async getMySupports(userId: string) {
    return await this.statisticsPort.getMySupports(userId);
  }
}
