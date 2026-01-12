import { UserMembershipHistoryItem } from '@app/shared/domain/queries/get-my-collaborations.query';
import { Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { MyMembershipsPort } from '../ports/my-memberships.port';
import { GetMyMembershipsQuery } from '../queries/get-my-memberships.query';

@QueryHandler(GetMyMembershipsQuery)
export class GetMyMembershipsHandler {
  private readonly logger = new Logger(GetMyMembershipsHandler.name);

  constructor(private readonly port: MyMembershipsPort) {}

  async execute(
    query: GetMyMembershipsQuery,
  ): Promise<UserMembershipHistoryItem[]> {
    this.logger.debug(`Received memberships query for userId: ${query.userId}`);
    return this.port.getUserMemberships(query.userId);
  }
}
