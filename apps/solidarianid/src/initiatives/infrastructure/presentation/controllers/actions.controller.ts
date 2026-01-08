import { Either } from '@app/shared/domain';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Headers,
  Inject,
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
  ApiTags,
} from '@nestjs/swagger';
import { UserIsNotAdminError } from '../../../../communities/domain/community.aggregate';
import {
  ActionsPort,
  CreateActionError,
  FundingActionOut,
  VolunteeringActionOut,
} from '../../../application/ports/actions.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause.repository';
import { CauseAlreadyClosedError } from '../../../domain/value-objects/cause-status.vo';
import { FundingActionDto, VolunteeringActionDto } from '../dtos/action.dto';
import { CreateFundingActionDto } from '../dtos/create-funding-action.dto';
import { CreateVolunteeringActionDto } from '../dtos/create-volunteering-action.dto';

@Controller('causes/:causeId/actions')
@ApiTags('actions')
export class ActionsController {
  constructor(
    @Inject(ActionsPort)
    private readonly actionsService: ActionsPort,
  ) {}

  @Post('funding')
  @ApiHeader({
    name: 'userId',
    required: true,
    description: 'Administrator user id of the community',
  })
  @ApiBody({ type: CreateFundingActionDto })
  @ApiCreatedResponse({
    description: 'Action created successfully',
    type: FundingActionDto,
  })
  async createFunding(
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @Body() dto: CreateFundingActionDto,
    @Headers('userId') userId?: string,
  ): Promise<FundingActionOut> {
    if (!userId) {
      throw new UnauthorizedException('userId header is required');
    }

    return this.mapResult(
      await this.actionsService.createFundingAction({
        causeId,
        requesterId: userId,
        data: dto,
      }),
    );
  }

  @Post('volunteering')
  @ApiHeader({
    name: 'userId',
    required: true,
    description: 'Administrator user id of the community',
  })
  @ApiBody({ type: CreateVolunteeringActionDto })
  @ApiCreatedResponse({
    description: 'Action created successfully',
    type: VolunteeringActionDto,
  })
  async createVolunteering(
    @Param('causeId', ParseUUIDPipe) causeId: string,
    @Body() dto: CreateVolunteeringActionDto,
    @Headers('userId') userId?: string,
  ): Promise<VolunteeringActionOut> {
    if (!userId) {
      throw new UnauthorizedException('userId header is required');
    }

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
      if (err instanceof CauseAlreadyClosedError) {
        throw new BadRequestException(err.message);
      }
      throw new BadRequestException(err.message);
    }

    return result.value;
  }
}
