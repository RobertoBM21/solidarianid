import { UserSupportHistoryItem } from '@app/shared/domain/queries/get-my-collaborations.query';
import { Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { InitiativesStatisticsPort } from '../../domain/ports/initiatives-statistics.port';
import { GetMySupportsQuery } from '../queries/get-my-supports.query';

@QueryHandler(GetMySupportsQuery)
export class GetMySupportsHandler {
  private readonly logger = new Logger(GetMySupportsHandler.name);

  constructor(private readonly statisticsPort: InitiativesStatisticsPort) {}

  async execute(query: GetMySupportsQuery): Promise<UserSupportHistoryItem[]> {
    this.logger.debug(`Received supports query for userId: ${query.userId}`);
    return await this.statisticsPort.getMySupports(query.userId);
  }
}
