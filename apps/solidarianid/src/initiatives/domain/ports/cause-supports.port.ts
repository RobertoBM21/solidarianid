import { DomainError, Either } from '@app/shared/domain';
import { InvalidDateError } from '@app/shared/domain/value-objects/creation-date.vo';
import { UserNotFoundError } from '../../../identity/domain/repositories/user.repository';
import { CauseSupportNotFoundError } from '../repositories/cause-support.repository';
import { CauseNotFoundError } from '../repositories/cause.repository';
import { AnonymousSupporterError } from './anonymous-supporter.repository';

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
    anonymousName: string;
    anonymousEmail: string;
  }): Promise<Either<RegisterAnonymousSupportError, void>>;

  abstract cancelSupport(options: {
    causeId: string;
    userId: string;
  }): Promise<Either<CauseSupportNotFoundError, void>>;
}
