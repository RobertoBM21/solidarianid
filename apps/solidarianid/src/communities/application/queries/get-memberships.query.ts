import { Query } from '@nestjs/cqrs';

export interface GetMembershipsQueryResult {
  communityNamesPerUser: Map<string, string[]>;
}

export class GetMembershipsQuery extends Query<GetMembershipsQueryResult> {
  constructor(public readonly userIds: string[]) {
    super();
  }
}
