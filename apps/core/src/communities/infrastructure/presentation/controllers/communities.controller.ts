import { AuthGuard, AuthId } from '@app/shared/infrastructure/auth';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CommunityOutDto } from '../../../application/dtos/community-out.dto';
import { CommunitiesPort } from '../../../application/ports/communities.port';
import { CommunityListItemDto } from '../dtos/community-list-item.dto';
import { CommunityProposalDto } from '../dtos/community-proposal.dto';
import { ProposeCommunityDto } from '../dtos/propose-community.dto';

@Controller('communities')
@ApiTags('communities')
export class CommunitiesController {
  constructor(private readonly communitiesPort: CommunitiesPort) {}

  @Get()
  @ApiOkResponse({
    description: 'List of communities retrieved successfully',
    type: [CommunityListItemDto],
  })
  @ApiQuery({ name: 'field', enum: ['name', 'createdAt'], required: false })
  @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
  @ApiQuery({ name: 'search', required: false })
  async list(
    @Query('field') field?: 'name' | 'createdAt',
    @Query('order') order?: 'ASC' | 'DESC',
    @Query('search') search?: string,
  ): Promise<CommunityListItemDto[]> {
    const sort = field || order ? { field, order } : undefined;
    return await this.communitiesPort.listCommunities(search, sort);
  }

  @Post()
  @ApiBearerAuth()
  @ApiBody({ type: ProposeCommunityDto })
  @ApiCreatedResponse({
    description: 'Community proposal created successfully',
    type: CommunityProposalDto,
  })
  @UseGuards(AuthGuard)
  async proposeCommunity(
    @Body() dto: ProposeCommunityDto,
    @AuthId() requesterId: string,
  ): Promise<CommunityProposalDto> {
    const result = await this.communitiesPort.proposeCommunity(
      dto,
      requesterId,
    );
    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  @Get(':communityId')
  @ApiOkResponse({
    description: 'Detailed information of a community retrieved successfully',
    type: CommunityOutDto,
  })
  @ApiQuery({ name: 'id', required: true })
  async detail(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @AuthId({ optional: true }) requesterId?: string,
  ): Promise<CommunityOutDto> {
    const communityOrError = await this.communitiesPort.getCommunity(
      communityId,
      requesterId,
    );
    if (communityOrError.isLeft()) {
      throw new NotFoundException(communityOrError.value.message);
    }
    return communityOrError.value;
  }
}
