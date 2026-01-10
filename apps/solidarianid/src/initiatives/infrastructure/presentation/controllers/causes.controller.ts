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
import { CausesPort } from '../../../application/ports/causes.port';
import { CauseCreatedApiDto } from '../dtos/cause-created.api-dto';
import { CauseListItemApiDto } from '../dtos/cause-list-item.api-dto';
import { CreateCauseApiDto } from '../dtos/create-cause.api-dto';

@Controller('communities/:communityId/causes')
@ApiTags('causes')
export class CausesController {
  constructor(private readonly causesPort: CausesPort) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBody({ type: CreateCauseApiDto })
  @ApiCreatedResponse({
    description: 'Cause created successfully',
    type: CauseCreatedApiDto,
  })
  @ApiSecurity('userId')
  async create(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Body() dto: CreateCauseApiDto,
    @AuthId() userId: string,
  ): Promise<CauseCreatedApiDto> {
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
    type: [CauseListItemApiDto],
  })
  async list(
    @Param('communityId', ParseUUIDPipe) communityId: string,
  ): Promise<CauseListItemApiDto[]> {
    const result = await this.causesPort.listByCommunity(communityId);
    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }
    return result.value;
  }
}
