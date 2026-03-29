import { DomainError } from '@app/shared/domain';
import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthId } from '../../../../identity/infrastructure/decorators/auth-id.decorator';
import { AuthGuard } from '../../../../identity/infrastructure/guards/auth.guard';
import { CausesPort } from '../../../application/ports/causes.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause.repository';
import { CauseApiDto } from '../dtos/cause.api-dto';

@Controller('causes/:causeId')
@ApiTags('causes')
export class CauseController {
  constructor(private readonly causesPort: CausesPort) {}

  @Get()
  @ApiOkResponse({
    description: 'Cause detail',
    type: CauseApiDto,
  })
  @ApiSecurity('userId')
  async detail(
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @AuthId({ optional: true }) userId?: string,
  ): Promise<CauseApiDto> {
    const result = await this.causesPort.getCause(causeId, userId);
    if (result.isLeft()) {
      const err: DomainError = result.value;
      if (err instanceof CauseNotFoundError) {
        throw new NotFoundException(err.message);
      }
      throw new BadRequestException(err.message);
    }
    return result.value;
  }

  @Post('close')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Cause closed successfully',
  })
  @ApiSecurity('userId')
  async close(
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @AuthId() userId: string,
  ): Promise<void> {
    const result = await this.causesPort.closeCause(causeId, userId);
    if (result.isLeft()) {
      if (result.value instanceof CauseNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
  }
}
