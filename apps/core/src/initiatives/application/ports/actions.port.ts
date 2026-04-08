import { Either, UniqueEntityID } from '@app/shared/domain';
import { UserIsNotAdminError } from '../../../communities/domain/community.aggregate';
import { CommunityNotFoundError } from '../../../communities/domain/repositories/community.repository';
import { ActionCreationError } from '../../domain/aggregates/action.aggregate';
import { CauseNotFoundError } from '../../domain/repositories/cause-aggr.repository';
import { InitiativeAlreadyClosedError } from '../../domain/value-objects/initiative-status.vo';
import { CreateFundingActionDto } from '../dtos/create-funding-action.dto';
import { CreateVolunteeringActionDto } from '../dtos/create-volunteering-action.dto';

export type CreateActionError =
  | ActionCreationError
  | CauseNotFoundError
  | CommunityNotFoundError
  | UserIsNotAdminError
  | InitiativeAlreadyClosedError;

interface BaseActionOut {
  id: string;
  causeId: string;
  title: string;
  description: string;
  objectives: string[];
  closed: boolean;
  createdAt: string;
}

export interface FundingActionOut extends BaseActionOut {
  type: 'funding';
  targetAmount: number;
  currentAmount: number;
}

export interface VolunteeringActionOut extends BaseActionOut {
  type: 'volunteering';
  start: string;
  end: string;
}

export type ActionOut = FundingActionOut | VolunteeringActionOut;

export abstract class ActionsPort {
  abstract createFundingAction(
    causeId: UniqueEntityID,
    requesterId: UniqueEntityID,
    data: CreateFundingActionDto,
  ): Promise<Either<CreateActionError, FundingActionOut>>;

  abstract createVolunteeringAction(
    causeId: UniqueEntityID,
    requesterId: UniqueEntityID,
    data: CreateVolunteeringActionDto,
  ): Promise<Either<CreateActionError, VolunteeringActionOut>>;
}
