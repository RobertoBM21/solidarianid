import { Either } from '@app/shared/domain';
import { CommunityNotFoundError } from '../../../communities/domain/repositories/community.repository';
import {
  CauseAlreadyClosedError,
  CauseCreationError,
} from '../../domain/aggregates/cause.aggregate';
import { CauseNotFoundError } from '../../domain/repositories/cause.repository';
import { CauseCreatedDto } from '../dtos/cause-created.dto';
import { CauseListItemDto } from '../dtos/cause-list-item.dto';
import { CauseDto } from '../dtos/cause.dto';

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

export abstract class CausesPort {
  abstract createCause(
    communityId: string,
    data: CreateCauseData,
    userId: string,
  ): Promise<Either<CreateCauseError, CauseCreatedDto>>;

  abstract listByCommunity(
    communityId: string,
  ): Promise<Either<CommunityNotFoundError, CauseListItemDto[]>>;

  abstract getCause(
    causeId: string,
    userId?: string,
  ): Promise<Either<CauseNotFoundError, CauseDto>>;

  abstract closeCause(
    causeId: string,
    userId: string,
  ): Promise<Either<CloseCauseError, void>>;
}
