import { DomainError } from '@app/shared/domain';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommunityNotFoundError } from '../../../../communities/domain/repositories/community.repository';
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
  @ApiBody({ type: CreateCauseDto })
  @ApiCreatedResponse({
    description: 'Cause created successfully',
    type: CauseDto,
  })
  async create(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Body() dto: CreateCauseDto,
  ): Promise<CauseOutDto> {
    const result = await this.causesPort.createCause(communityId, dto);

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
  @ApiHeader({
    name: 'userId',
    required: false,
    description:
      'Registered user id used to compute supportedByUser when authenticated',
  })
  @ApiOkResponse({
    description: 'Cause detail',
    type: CauseDto,
  })
  async detail(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @Headers('userId') userId?: string,
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
  @ApiOkResponse({
    description: 'Cause closed successfully',
  })
  async close(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('causeId', ParseUUIDPipe) causeId: string,
  ): Promise<void> {
    const result = await this.causesPort.closeCause(communityId, causeId);
    if (result.isLeft()) {
      if (result.value instanceof CommunityNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
  }
}
