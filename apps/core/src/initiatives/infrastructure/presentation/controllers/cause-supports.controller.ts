import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { AuthId } from '../../../../identity/infrastructure/decorators/auth-id.decorator';
import { AuthGuard } from '../../../../identity/infrastructure/guards/auth.guard';
import { RegisterAnonymousSupportDto } from '../../../application/dtos/register-anonymous-support.dto';
import { CauseSupportsPort } from '../../../application/ports/cause-supports.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause-aggr.repository';

@Controller('causes/:causeId/supports')
@ApiTags('causes')
export class CauseSupportsController {
  constructor(private readonly causeSupportsPort: CauseSupportsPort) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiCreatedResponse({ description: 'Support registered' })
  @ApiSecurity('userId')
  async supportRegistered(
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @AuthId() userId: string,
  ): Promise<void> {
    const result = await this.causeSupportsPort.registerSupportForUser({
      causeId,
      userId,
    });

    if (result.isLeft()) {
      const err = result.value;
      if (err instanceof CauseNotFoundError) {
        throw new NotFoundException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }

  @Post('create-anonymous')
  @ApiBody({
    type: RegisterAnonymousSupportDto,
    description: 'Anonymous support data',
  })
  @ApiCreatedResponse({ description: 'Support registered' })
  async supportAnonymous(
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @Body() dto: RegisterAnonymousSupportDto,
  ): Promise<void> {
    const result = await this.causeSupportsPort.registerSupportForAnonymous({
      causeId,
      data: dto,
    });

    if (result.isLeft()) {
      const err = result.value;
      if (err instanceof CauseNotFoundError) {
        throw new NotFoundException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }

  @Delete()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Support cancelled' })
  @ApiSecurity('userId')
  async cancelSupport(
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @AuthId() userId: string,
  ): Promise<void> {
    const result = await this.causeSupportsPort.cancelSupport(causeId, userId);
    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }
  }
}
