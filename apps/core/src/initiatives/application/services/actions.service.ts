import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { IsCommunityAdminQuery } from '../../../communities/application/queries/is-community-admin.query';
import { UserIsNotAdminError } from '../../../communities/domain/community.aggregate';
import {
  FundingAction,
  VolunteeringAction,
} from '../../domain/aggregates/action.aggregate';
import { ActionRepository } from '../../domain/repositories/action.repository';
import { CauseRepository } from '../../domain/repositories/cause.repository';
import { InitiativeAlreadyClosedError } from '../../domain/value-objects/initiative-status.vo';
import {
  FundingActionOutDto,
  VolunteeringActionOutDto,
} from '../dtos/action-out.dto';
import {
  ActionsPort,
  CreateActionError,
  CreateFundingActionRequest,
  CreateVolunteeringActionRequest,
  FundingActionOut,
  VolunteeringActionOut,
} from '../ports/actions.port';

@Injectable()
export class ActionsService extends ActionsPort {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly causeRepository: CauseRepository,
    private readonly queryBus: QueryBus,
  ) {
    super();
  }

  async createFundingAction(
    request: CreateFundingActionRequest,
  ): Promise<Either<CreateActionError, FundingActionOut>> {
    const { causeId, requesterId, data } = request;
    const causeOrError = await this.ensureCanCreateAction(causeId, requesterId);
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
    request: CreateVolunteeringActionRequest,
  ): Promise<Either<CreateActionError, VolunteeringActionOut>> {
    const { causeId, requesterId, data } = request;
    const causeOrError = await this.ensureCanCreateAction(causeId, requesterId);
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

  private async ensureCanCreateAction(
    causeId: string,
    requesterId: string,
  ): Promise<Either<CreateActionError, { id: UniqueEntityID }>> {
    const causeResult = await this.causeRepository.findById(
      UniqueEntityID.create(causeId),
    );
    if (causeResult.isLeft()) {
      return left(causeResult.value);
    }
    const cause = causeResult.value;
    if (cause.closed) {
      return left(new InitiativeAlreadyClosedError());
    }

    const isAdmin = await this.queryBus.execute(
      new IsCommunityAdminQuery(
        cause.communityId,
        UniqueEntityID.create(requesterId),
      ),
    );
    if (!isAdmin) {
      return left(new UserIsNotAdminError(cause.communityId.toString()));
    }

    return right({ id: cause.id });
  }
}
