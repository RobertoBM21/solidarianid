import { DomainError } from '@app/shared/domain';
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthId } from '../../../../identity/infrastructure/decorators/auth-id.decorator';
import { CausesPort } from '../../../application/ports/causes.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause-aggr.repository';
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
}
