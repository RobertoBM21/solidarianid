import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Headers,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CauseSupportsPort } from '../../../domain/ports/cause-supports.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause.repository';
import { RegisterAnonymousSupportDto } from '../dtos/register-anonymous-support.dto';

@Controller(':causeId/supports')
@ApiTags('causes')
export class CauseSupportsController {
  constructor(private readonly causeSupportsPort: CauseSupportsPort) {}

  @Post()
  @ApiHeader({
    name: 'userId',
    required: true,
    description: 'Registered user id',
  })
  @ApiCreatedResponse({ description: 'Support registered' })
  async supportRegistered(
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @Headers('userId') userId?: string,
  ): Promise<void> {
    if (!userId) {
      throw new BadRequestException('userId header is required');
    }

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

  @Post('anonymous')
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
      anonymousEmail: dto.anonymousEmail,
      anonymousName: dto.anonymousName,
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
  @ApiOkResponse({ description: 'Support cancelled' })
  @ApiHeader({
    name: 'userId',
    required: true,
    description: 'Registered user ID for authentication',
  })
  async cancelSupport(
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @Headers('userId') userId?: string,
  ): Promise<void> {
    if (!userId) {
      throw new UnauthorizedException();
    }
    const result = await this.causeSupportsPort.cancelSupport({
      causeId,
      userId,
    });
    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }
  }
}
