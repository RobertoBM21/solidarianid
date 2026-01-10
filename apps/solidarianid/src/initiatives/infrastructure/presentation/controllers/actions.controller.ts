import { Either } from '@app/shared/domain';
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
  ApiBody,
  ApiCreatedResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { UserIsNotAdminError } from '../../../../communities/domain/community.aggregate';
import { AuthId } from '../../../../identity/infrastructure/decorators/auth-id.decorator';
import { AuthGuard } from '../../../../identity/infrastructure/guards/auth.guard';
import {
  ActionsPort,
  CreateActionError,
  FundingActionOut,
  VolunteeringActionOut,
} from '../../../application/ports/actions.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause.repository';
import { InitiativeAlreadyClosedError } from '../../../domain/value-objects/initiative-status.vo';
import {
  FundingActionApiDto,
  VolunteeringActionApiDto,
} from '../dtos/action.api-dto';
import { CreateFundingActionApiDto } from '../dtos/create-funding-action.api-dto';
import { CreateVolunteeringActionApiDto } from '../dtos/create-volunteering-action.api-dto';

@Controller('causes/:causeId/actions')
@ApiTags('actions')
@UseGuards(AuthGuard)
export class ActionsController {
  constructor(
    @Inject(ActionsPort)
    private readonly actionsService: ActionsPort,
  ) {}

  @Post('funding')
  @ApiBody({ type: CreateFundingActionApiDto })
  @ApiCreatedResponse({
    description: 'Action created successfully',
    type: FundingActionApiDto,
  })
  @ApiSecurity('userId')
  async createFunding(
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @Body() dto: CreateFundingActionApiDto,
    @AuthId() userId: string,
  ): Promise<FundingActionOut> {
    return this.mapResult(
      await this.actionsService.createFundingAction({
        causeId,
        requesterId: userId,
        data: dto,
      }),
    );
  }

  @Post('volunteering')
  @ApiBody({ type: CreateVolunteeringActionApiDto })
  @ApiCreatedResponse({
    description: 'Action created successfully',
    type: VolunteeringActionApiDto,
  })
  @ApiSecurity('userId')
  async createVolunteering(
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @Body() dto: CreateVolunteeringActionApiDto,
    @AuthId() userId: string,
  ): Promise<VolunteeringActionOut> {
    return this.mapResult(
      await this.actionsService.createVolunteeringAction({
        causeId,
        requesterId: userId,
        data: dto,
      }),
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
