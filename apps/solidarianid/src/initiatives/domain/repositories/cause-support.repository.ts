import {
  DomainError,
  Either,
  Repository,
  UniqueEntityID,
} from '@app/shared/domain';
import { CauseSupport } from '../aggregates/cause-support.aggregate';
import { Supporter } from '../value-objects/supporter.vo';

export class CauseSupportNotFoundError implements DomainError {
  message = 'Cause support not found';
}

export abstract class CauseSupportRepository extends Repository<
  CauseSupport,
  CauseSupportNotFoundError
> {
  abstract findBySupporterAndCause(
    supporter: Supporter,
    causeId: UniqueEntityID,
  ): Promise<Either<CauseSupportNotFoundError, CauseSupport>>;

  abstract existsForSupporterAndCause(
    supporter: Supporter,
    causeId: UniqueEntityID,
  ): Promise<boolean>;

  abstract removeByUserAndCause(
    userId: UniqueEntityID,
    causeId: UniqueEntityID,
  ): Promise<Either<CauseSupportNotFoundError, void>>;
}
