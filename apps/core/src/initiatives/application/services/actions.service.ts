import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { UserIsNotAdminError } from '../../../communities/domain/community.aggregate';
import {
  FundingAction,
  VolunteeringAction,
} from '../../domain/aggregates/action.aggregate';
import { CauseAggr } from '../../domain/aggregates/cause.aggregate';
import { CommunityAuthorizationPort } from '../../domain/ports/community-authz.port';
import { ActionRepository } from '../../domain/repositories/action.repository';
import { CauseAggrRepository } from '../../domain/repositories/cause-aggr.repository';
import { InitiativeAlreadyClosedError } from '../../domain/value-objects/initiative-status.vo';
import {
  FundingActionOutDto,
  VolunteeringActionOutDto,
} from '../dtos/action-out.dto';
import { CreateFundingActionDto } from '../dtos/create-funding-action.dto';
import { CreateVolunteeringActionDto } from '../dtos/create-volunteering-action.dto';
import {
  ActionsPort,
  CreateActionError,
  FundingActionOut,
  VolunteeringActionOut,
} from '../ports/actions.port';

@Injectable()
export class ActionsService extends ActionsPort {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly causeAggrRepository: CauseAggrRepository,
    private readonly communityAuthzPort: CommunityAuthorizationPort,
  ) {
    super();
  }

  async createFundingAction(
    causeId: UniqueEntityID,
    requesterId: UniqueEntityID,
    data: CreateFundingActionDto,
  ): Promise<Either<CreateActionError, FundingActionOut>> {
    const causeOrError = await this.getCauseAggrIfCanCreateActions(
      causeId,
      requesterId,
    );
    if (causeOrError.isLeft()) {
      return left(causeOrError.value);
    }
    const cause = causeOrError.value;
    const actionOrError = FundingAction.create({
      title: data.title,
      description: data.description,
      objectives: data.objectives,
      targetAmount: data.targetAmount,
      causeId: cause.id.toString(),
    });
    if (actionOrError.isLeft()) {
      return left(actionOrError.value);
    }
    const action = actionOrError.value;
    await this.actionRepository.save(action);
    return right(new FundingActionOutDto(action));
  }

  async createVolunteeringAction(
    causeId: UniqueEntityID,
    requesterId: UniqueEntityID,
    data: CreateVolunteeringActionDto,
  ): Promise<Either<CreateActionError, VolunteeringActionOut>> {
    const causeOrError = await this.getCauseAggrIfCanCreateActions(
      causeId,
      requesterId,
    );
    if (causeOrError.isLeft()) {
      return left(causeOrError.value);
    }
    const cause = causeOrError.value;
    const actionOrError = VolunteeringAction.create({
      title: data.title,
      description: data.description,
      objectives: data.objectives,
      start: data.start,
      end: data.end,
      causeId: cause.id.toString(),
    });
    if (actionOrError.isLeft()) {
      return left(actionOrError.value);
    }
    const action = actionOrError.value;
    await this.actionRepository.save(action);
    return right(new VolunteeringActionOutDto(action));
  }

  private async getCauseAggrIfCanCreateActions(
    causeId: UniqueEntityID,
    userId: UniqueEntityID,
  ): Promise<Either<CreateActionError, CauseAggr>> {
    const causeOrError = await this.causeAggrRepository.findById(causeId);
    if (causeOrError.isLeft()) {
      return left(causeOrError.value);
    }
    const cause = causeOrError.value;
    if (cause.closed) {
      return left(new InitiativeAlreadyClosedError());
    }
    const canManageCommunity = await this.communityAuthzPort.canManageCommunity(
      userId.toString(),
      cause.communityId.toString(),
    );
    if (!canManageCommunity) {
      return left(new UserIsNotAdminError(cause.communityId.toString()));
    }
    return right(cause);
  }
}
