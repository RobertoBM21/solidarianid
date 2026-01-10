import { Either } from '@app/shared/domain';
import { UserIsNotAdminError } from '../../../communities/domain/community.aggregate';
import { CommunityNotFoundError } from '../../../communities/domain/repositories/community.repository';
import { ActionCreationError } from '../../domain/aggregates/action.aggregate';
import { CauseNotFoundError } from '../../domain/repositories/cause.repository';
import { InitiativeAlreadyClosedError } from '../../domain/value-objects/initiative-status.vo';

export type CreateActionError =
  | ActionCreationError
  | CauseNotFoundError
  | CommunityNotFoundError
  | UserIsNotAdminError
  | InitiativeAlreadyClosedError;

export interface CreateBaseActionData {
  title: string;
  description: string;
  objectives: string[];
}

export interface CreateFundingActionData extends CreateBaseActionData {
  targetAmount: number;
}

export interface CreateVolunteeringActionData extends CreateBaseActionData {
  start: Date | string;
  end: Date | string;
}

export interface CreateActionRequest<T> {
  causeId: string;
  requesterId: string;
  data: T;
}

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
    request: CreateActionRequest<CreateFundingActionData>,
  ): Promise<Either<CreateActionError, FundingActionOut>>;

  abstract createVolunteeringAction(
    request: CreateActionRequest<CreateVolunteeringActionData>,
  ): Promise<Either<CreateActionError, VolunteeringActionOut>>;
}
