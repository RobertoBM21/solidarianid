import { DomainError } from '@app/shared/domain';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CommunityNotFoundError } from '../../../../communities/domain/repositories/community.repository';
import { AuthId } from '../../../../identity/infrastructure/decorators/auth-id.decorator';
import { AuthGuard } from '../../../../identity/infrastructure/guards/auth.guard';
import { CauseOutDto } from '../../../application/dtos/cause-out.dto';
import { CausesPort } from '../../../domain/ports/causes.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause.repository';
import { CauseDto } from '../dtos/cause.dto';
import { CreateCauseDto } from '../dtos/create-cause.dto';

@Controller('communities/:communityId/causes')
@ApiTags('causes')
export class CausesController {
  constructor(private readonly causesPort: CausesPort) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBody({ type: CreateCauseDto })
  @ApiCreatedResponse({
    description: 'Cause created successfully',
    type: CauseDto,
  })
  @ApiSecurity('userId')
  async create(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Body() dto: CreateCauseDto,
    @AuthId() userId: string,
  ): Promise<CauseOutDto> {
    const result = await this.causesPort.createCause(communityId, dto, userId);

    if (result.isLeft()) {
      if (result.value instanceof CommunityNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }

    return result.value;
  }

  @Get()
  @ApiOkResponse({
    description: 'List of causes for the community',
    type: [CauseDto],
  })
  async list(
    @Param('communityId', ParseUUIDPipe) communityId: string,
  ): Promise<CauseDto[]> {
    const result = await this.causesPort.listByCommunity(communityId);
    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }
    return result.value;
  }

  @Get(':causeId')
  @ApiOkResponse({
    description: 'Cause detail',
    type: CauseDto,
  })
  @ApiSecurity('userId')
  async detail(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @AuthId({ optional: true }) userId?: string,
  ): Promise<CauseDto> {
    const result = await this.causesPort.getCause(communityId, causeId, userId);
    if (result.isLeft()) {
      const err: DomainError = result.value;
      if (err instanceof CauseNotFoundError) {
        throw new NotFoundException(err.message);
      }
      throw new BadRequestException(err.message);
    }
    return result.value;
  }

  @Post(':causeId/close')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    description: 'Cause closed successfully',
  })
  @ApiSecurity('userId')
  async close(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @AuthId() userId: string,
  ): Promise<void> {
    const result = await this.causesPort.closeCause(
      communityId,
      causeId,
      userId,
    );
    if (result.isLeft()) {
      if (result.value instanceof CommunityNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
  }
}
