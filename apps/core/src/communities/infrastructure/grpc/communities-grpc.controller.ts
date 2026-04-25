import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import type {
  GetMembershipsRequest,
  GetMembershipsResponse,
} from '@app/shared/infrastructure/grpc/stubs/communities';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { CommunitiesStatisticsData } from '../../application/dtos/communities-statistics.dto';
import { CommunityStatisticsPort } from '../../application/ports/community-statistics.port';
import { CommunityMemberRepository } from '../../domain/repositories/community-member.repository';

@Controller()
@ApiExcludeController()
export class CommunitiesGrpcController {
  private readonly logger = new Logger(CommunitiesGrpcController.name);

  constructor(
    private readonly communityStatisticsPort: CommunityStatisticsPort,
    private readonly communityMemberRepo: CommunityMemberRepository,
  ) {}

  @GrpcMethod(GrpcPackages.Statistics.ServiceName)
  async getCommunitiesStatistics(): Promise<CommunitiesStatisticsData> {
    this.logger.debug(`Handling community statistics query`);
    const data = await this.communityStatisticsPort.getCommunitiesStatistics();
    return { data };
  }

  @GrpcMethod(GrpcPackages.Communities.ServiceName)
  async getMemberships(
    request: GetMembershipsRequest,
  ): Promise<GetMembershipsResponse> {
    this.logger.debug(`Handling getMemberships query`);
    const memberships = await this.communityMemberRepo.listByUserIds(
      request.userIds,
    );
    return {
      memberships: Array.from(memberships.entries()).map(
        ([userId, communities]) => ({
          userId,
          communities,
        }),
      ),
    };
  }
}
