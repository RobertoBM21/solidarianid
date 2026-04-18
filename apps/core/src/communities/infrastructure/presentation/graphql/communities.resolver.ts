import { NotFoundException } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthId } from '../../../../identity/infrastructure/decorators/gql-auth-id.decorator';
import { CommunityOutDto } from '../../../application/dtos/community-out.dto';
import { CommunitiesPort } from '../../../application/ports/communities.port';
import { CommunityType } from './types/community.type';

@Resolver(() => CommunityType)
export class CommunitiesResolver {
  constructor(private readonly communitiesPort: CommunitiesPort) {}

  @Query(() => [CommunityType], {
    name: 'communities',
    description: 'List all communities, optionally filtered by search term',
  })
  async communities(
    @Args('search', { nullable: true }) search?: string,
    @Args('sortField', { nullable: true }) sortField?: 'name' | 'createdAt',
    @Args('sortOrder', { nullable: true }) sortOrder?: 'ASC' | 'DESC',
  ): Promise<CommunityType[]> {
    const dtos = await this.communitiesPort.listCommunities(search, {
      field: sortField,
      order: sortOrder,
    });
    return dtos.map((dto) => this.mapCommunity(dto));
  }

  @Query(() => CommunityType, {
    name: 'community',
    description: 'Get a single community by ID',
  })
  async community(
    @Args('id') id: string,
    @GqlAuthId({ optional: true }) requesterId?: string,
  ): Promise<CommunityType> {
    const result = await this.communitiesPort.getCommunity(id, requesterId);

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return this.mapCommunity(result.value);
  }

  private mapCommunity(dto: CommunityOutDto): CommunityType {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      createdAt: dto.createdAt,
      isCommunityAdmin: dto.isCommunityAdmin,
      causes: dto.causes.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        duration: c.duration,
        ods: c.ods,
        status: c.closed,
        createdAt: c.createdAt,
      })),
    };
  }
}
