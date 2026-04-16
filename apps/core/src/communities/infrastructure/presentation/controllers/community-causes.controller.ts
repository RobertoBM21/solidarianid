import { UniqueEntityID } from '@app/shared/domain';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthId } from '../../../../identity/infrastructure/decorators/auth-id.decorator';
import { AuthGuard } from '../../../../identity/infrastructure/guards/auth.guard';
import { CauseDto } from '../../../application/dtos/community-out.dto';
import { CreateCauseDto } from '../../../application/dtos/create-cause.dto';
import { CommunitiesPort } from '../../../application/ports/communities.port';
import { CommunityNotFoundError } from '../../../domain/repositories/community.repository';
import { InvalidCausesListError } from '../../../domain/value-objects/causes-list.vo';

@Controller('communities/:communityId/causes')
@ApiTags('communities')
@ApiBearerAuth()
export class CommunityCausesController {
  constructor(private readonly communitiesPort: CommunitiesPort) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBody({ type: CreateCauseDto })
  @ApiCreatedResponse({
    description: 'Cause created successfully',
    type: CauseDto,
  })
  @ApiBearerAuth()
  async create(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Body() dto: CreateCauseDto,
    @AuthId() userId: string,
  ): Promise<CauseDto> {
    const result = await this.communitiesPort.createCause(
      dto,
      UniqueEntityID.create(communityId),
      UniqueEntityID.create(userId),
    );

    if (result.isLeft()) {
      if (result.value instanceof CommunityNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }

    return new CauseDto(result.value);
  }

  @Post(':causeId/close')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Cause closed successfully',
  })
  @ApiBearerAuth()
  async close(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @AuthId() userId: string,
  ): Promise<void> {
    const result = await this.communitiesPort.closeCause(
      UniqueEntityID.create(communityId),
      UniqueEntityID.create(causeId),
      UniqueEntityID.create(userId),
    );
    if (result.isLeft()) {
      if (
        result.value instanceof CommunityNotFoundError ||
        result.value instanceof InvalidCausesListError
      ) {
        throw new NotFoundException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
  }
}
