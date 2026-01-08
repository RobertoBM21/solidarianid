import { Either } from '@app/shared/domain';
import { CommunityNotFoundError } from '../../../communities/domain/repositories/community.repository';
import { ActionOut } from '../../application/ports/actions.port';
import {
  CauseAlreadyClosedError,
  CauseCreationError,
} from '../aggregates/cause.aggregate';
import { CauseNotFoundError } from '../repositories/cause.repository';

export type CreateCauseError = CauseCreationError | CommunityNotFoundError;
export type CloseCauseError =
  | CauseNotFoundError
  | CauseAlreadyClosedError
  | Error;

export interface CreateCauseData {
  title: string;
  description: string;
  duration: string;
  ods: number;
}

export interface CauseOut {
  id: string;
  communityId: string;
  title: string;
  description: string;
  duration: string;
  ods: number;
  closed: boolean;
  createdAt: string;
  actions?: ActionOut[];
}

export abstract class CausesServicePort {
  abstract createCause(
    communityId: string,
    data: CreateCauseData,
  ): Promise<Either<CreateCauseError, CauseOut>>;

  abstract listByCommunity(
    communityId: string,
  ): Promise<Either<CommunityNotFoundError, CauseOut[]>>;

  abstract getCause(
    communityId: string,
    causeId: string,
  ): Promise<Either<CauseNotFoundError, CauseOut>>;

  abstract closeCause(
    communityId: string,
    causeId: string,
  ): Promise<Either<CloseCauseError, void>>;
}
