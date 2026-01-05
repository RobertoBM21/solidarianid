import {
  DomainError,
  Either,
  Repository,
  UniqueEntityID,
} from '@app/shared/domain';
import { Cause } from '../aggregates/cause.aggregate';

export class CauseNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly causeId: string) {
    this.message = `Cause with ID ${causeId} not found.`;
  }
}

export abstract class CausesRepository extends Repository<
  Cause,
  CauseNotFoundError
> {
  abstract listByCommunity(communityId: UniqueEntityID): Promise<Cause[]>;

  abstract findByIdAndCommunity(
    causeId: UniqueEntityID,
    communityId: UniqueEntityID,
  ): Promise<Either<CauseNotFoundError, Cause>>;
}
