import { Either } from '@app/shared/domain';
import { CauseOutDto } from '../../application/dtos/cause-out.dto';
import {
  CauseAlreadyClosedError,
  CauseCreationError,
} from '../aggregates/cause.aggregate';
import { CauseNotFoundError } from '../repositories/causes.repository';
import { CommunityNotFoundError } from '../repositories/communities.repository';

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

export abstract class CausesServicePort {
  abstract createCause(
    communityId: string,
    data: CreateCauseData,
  ): Promise<Either<CreateCauseError, CauseOutDto>>;

  abstract listByCommunity(
    communityId: string,
  ): Promise<Either<CommunityNotFoundError, CauseOutDto[]>>;

  abstract getCause(
    communityId: string,
    causeId: string,
  ): Promise<Either<CauseNotFoundError, CauseOutDto>>;

  abstract closeCause(
    communityId: string,
    causeId: string,
  ): Promise<Either<CloseCauseError, void>>;
}
