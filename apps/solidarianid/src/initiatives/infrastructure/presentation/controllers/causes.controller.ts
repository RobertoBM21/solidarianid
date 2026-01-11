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
import { CauseCreatedDto } from '../../../application/dtos/cause-created.dto';
import { CauseListItemDto } from '../../../application/dtos/cause-list-item.dto';
import { CreateCauseDto } from '../../../application/dtos/create-cause.dto';
import { CausesPort } from '../../../application/ports/causes.port';

@Controller('communities/:communityId/causes')
@ApiTags('causes')
export class CausesController {
  constructor(private readonly causesPort: CausesPort) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBody({ type: CreateCauseDto })
  @ApiCreatedResponse({
    description: 'Cause created successfully',
    type: CauseCreatedDto,
  })
  @ApiSecurity('userId')
  async create(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Body() dto: CreateCauseDto,
    @AuthId() userId: string,
  ): Promise<CauseCreatedDto> {
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
    type: [CauseListItemDto],
  })
  async list(
    @Param('communityId', ParseUUIDPipe) communityId: string,
  ): Promise<CauseListItemDto[]> {
    const result = await this.causesPort.listByCommunity(communityId);
    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }
    return result.value;
  }
}
