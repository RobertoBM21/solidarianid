import { Either, UniqueEntityID } from '@app/shared/domain';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Inject,
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
  ApiTags,
} from '@nestjs/swagger';
import { UserIsNotAdminError } from '../../../../communities/domain/community.aggregate';
import { AuthId } from '../../../../identity/infrastructure/decorators/auth-id.decorator';
import { AuthGuard } from '../../../../identity/infrastructure/guards/auth.guard';
import { CreateFundingActionDto } from '../../../application/dtos/create-funding-action.dto';
import { CreateVolunteeringActionDto } from '../../../application/dtos/create-volunteering-action.dto';
import {
  ActionsPort,
  CreateActionError,
  FundingActionOut,
  VolunteeringActionOut,
} from '../../../application/ports/actions.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause-aggr.repository';
import { InitiativeAlreadyClosedError } from '../../../domain/value-objects/initiative-status.vo';
import {
  FundingActionApiDto,
  VolunteeringActionApiDto,
} from '../dtos/action.api-dto';

@Controller('causes/:causeId/actions')
@ApiTags('actions')
@UseGuards(AuthGuard)
export class ActionsController {
  constructor(
    @Inject(ActionsPort)
    private readonly actionsService: ActionsPort,
  ) {}

  @Post('funding')
  @ApiBody({ type: CreateFundingActionDto })
  @ApiCreatedResponse({
    description: 'Action created successfully',
    type: FundingActionApiDto,
  })
  @ApiBearerAuth()
  async createFunding(
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @Body() dto: CreateFundingActionDto,
    @AuthId() userId: string,
  ): Promise<FundingActionOut> {
    return this.mapResult(
      await this.actionsService.createFundingAction(
        UniqueEntityID.create(causeId),
        UniqueEntityID.create(userId),
        dto,
      ),
    );
  }

  @Post('volunteering')
  @ApiBody({ type: CreateVolunteeringActionDto })
  @ApiCreatedResponse({
    description: 'Action created successfully',
    type: VolunteeringActionApiDto,
  })
  @ApiBearerAuth()
  async createVolunteering(
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @Body() dto: CreateVolunteeringActionDto,
    @AuthId() userId: string,
  ): Promise<VolunteeringActionOut> {
    return this.mapResult(
      await this.actionsService.createVolunteeringAction(
        UniqueEntityID.create(causeId),
        UniqueEntityID.create(userId),
        dto,
      ),
    );
  }

  private mapResult<T extends FundingActionOut | VolunteeringActionOut>(
    result: Either<CreateActionError, T>,
  ): T {
    if (result.isLeft()) {
      const err = result.value;
      if (err instanceof CauseNotFoundError) {
        throw new NotFoundException(err.message);
      }
      if (err instanceof UserIsNotAdminError) {
        throw new ForbiddenException(err.message);
      }
      if (err instanceof InitiativeAlreadyClosedError) {
        throw new BadRequestException(err.message);
      }
      throw new BadRequestException(err.message);
    }

    return result.value;
  }
}
