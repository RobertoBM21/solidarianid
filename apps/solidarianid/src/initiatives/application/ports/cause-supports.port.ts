import { DomainError, Either } from '@app/shared/domain';
import { InvalidDateError } from '@app/shared/domain/value-objects/creation-date.vo';
import { UserNotFoundError } from '../../../identity/domain/repositories/user.repository';
import { AnonymousSupporterError } from '../../domain/repositories/anonymous-supporter.repository';
import { CauseSupportNotFoundError } from '../../domain/repositories/cause-support.repository';
import { CauseNotFoundError } from '../../domain/repositories/cause.repository';

export class AlreadySupportingError implements DomainError {
  message = 'Support already registered for this cause and supporter.';
}

export type RegisterUserSupportError =
  | CauseNotFoundError
  | AlreadySupportingError
  | UserNotFoundError
  | InvalidDateError;

export type RegisterAnonymousSupportError =
  | CauseNotFoundError
  | AlreadySupportingError
  | InvalidDateError
  | AnonymousSupporterError;

export abstract class CauseSupportsPort {
  abstract registerSupportForUser(options: {
    causeId: string;
    userId: string;
  }): Promise<Either<RegisterUserSupportError, void>>;

  abstract registerSupportForAnonymous(options: {
    causeId: string;
    name: string;
    email: string;
  }): Promise<Either<RegisterAnonymousSupportError, void>>;

  abstract cancelSupport(options: {
    causeId: string;
    userId: string;
  }): Promise<Either<CauseSupportNotFoundError, void>>;
}
