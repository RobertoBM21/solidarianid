import { CommunityProposalAccepted } from '@app/shared/domain/events/community-proposal-accepted.event';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
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
  async list(): Promise<CommunityListItemDto[]> {
    return await this.communitiesPort.listCommunities();
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
