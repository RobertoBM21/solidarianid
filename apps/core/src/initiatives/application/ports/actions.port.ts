import { Either, UniqueEntityID } from '@app/shared/domain';
import { InitiativeAlreadyClosedError } from '@app/shared/domain/value-objects/initiative-status.vo';
import { UserIsNotAdminError } from '../../../communities/domain/community.aggregate';
import { CommunityNotFoundError } from '../../../communities/domain/repositories/community.repository';
import { ActionDefCreationError } from '../../domain/entities/action.entity';
import { CauseNotFoundError } from '../../domain/repositories/cause-aggr.repository';
import { InvalidActionsListError } from '../../domain/value-objects/actions-list.vo';
import { CreateFundingActionDto } from '../dtos/create-funding-action.dto';
import { CreateVolunteeringActionDto } from '../dtos/create-volunteering-action.dto';

export type CreateActionError =
  | ActionDefCreationError
  | InvalidActionsListError
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
