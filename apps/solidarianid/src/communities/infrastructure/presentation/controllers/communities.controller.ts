import { CommunityProposalAccepted } from '@app/shared/domain/events/community-proposal-accepted.event';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Query,
  Logger,
  Post,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { v4 } from 'uuid';
import { CommunitiesPort } from '../../../domain/ports/community.port';
import { CommunityListItemDto } from '../dtos/community-list-item.dto';
import { CommunityProposalDto } from '../dtos/community-proposal.dto';
import { ProposeCommunityDto } from '../dtos/propose-community.dto';

@Controller('communities')
@ApiTags('communities')
export class CommunitiesController {
  private readonly logger = new Logger(CommunitiesController.name);

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
  @ApiBody({ type: ProposeCommunityDto })
  @ApiCreatedResponse({
    description: 'Community proposal created successfully',
    type: CommunityProposalDto,
  })
  async proposeCommunity(
    @Body() dto: ProposeCommunityDto,
  ): Promise<CommunityProposalDto> {
    const requesterId = v4(); // TODO: get requester from authenticated user when authentication is implemented
    const result = await this.communitiesPort.proposeCommunity(
      dto,
      requesterId,
    );
    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  @MessagePattern(CommunityProposalAccepted.name)
  async handleCommunityProposalAccepted(
    event: CommunityProposalAccepted,
  ): Promise<void> {
    this.logger.debug(
      `Handling CommunityProposalAccepted event - name='${event.name}' requesterId=${event.requesterId}`,
    );

    const result = await this.communitiesPort.createCommunity({
      name: event.name,
      description: event.description,
      requesterId: event.requesterId,
    });
    if (result.isLeft()) {
      throw new Error(`Error creating community: ${result.value.message}`);
    }
  }
}
