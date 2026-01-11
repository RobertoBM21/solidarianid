import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthId } from '../../../../identity/infrastructure/decorators/auth-id.decorator';
import { AuthGuard } from '../../../../identity/infrastructure/guards/auth.guard';
import { CommunitiesPort } from '../../../domain/ports/community.port';
import { CommunityListItemDto } from '../dtos/community-list-item.dto';
import { CommunityProposalDto } from '../dtos/community-proposal.dto';
import { ProposeCommunityDto } from '../dtos/propose-community.dto';

@Controller('communities')
@ApiTags('communities')
@ApiSecurity('userId')
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
}
