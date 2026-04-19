import {
  DomainEventsPort,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { UserIsNotAdminError } from '../../../communities/domain/community.aggregate';
import { CauseAggr } from '../../domain/aggregates/cause.aggregate';
import { CommunityAuthorizationPort } from '../../domain/ports/community-authz.port';
import { CauseAggrRepository } from '../../domain/repositories/cause-aggr.repository';
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
    private readonly causeAggrRepository: CauseAggrRepository,
    private readonly communityAuthzPort: CommunityAuthorizationPort,
    private readonly domainEvents: DomainEventsPort,
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
    const actionOrError = cause.createFundingAction({
      title: data.title,
      description: data.description,
      objectives: data.objectives,
      targetAmount: data.targetAmount,
    });
    if (actionOrError.isLeft()) {
      return left(actionOrError.value);
    }
    await this.causeAggrRepository.save(cause);
    await this.domainEvents.dispatch(cause);
    return right(new FundingActionOutDto(actionOrError.value));
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
    const actionOrError = cause.createVolunteeringAction({
      title: data.title,
      description: data.description,
      objectives: data.objectives,
      start: data.start,
      end: data.end,
    });
    if (actionOrError.isLeft()) {
      return left(actionOrError.value);
    }
    await this.causeAggrRepository.save(cause);
    await this.domainEvents.dispatch(cause);
    return right(new VolunteeringActionOutDto(actionOrError.value));
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
