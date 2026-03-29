import { DomainError, Either } from '@app/shared/domain';
import { InvalidDateError } from '@app/shared/domain/value-objects/creation-date.vo';
import { UserNotFoundError } from '../../../identity/domain/repositories/user.repository';
import { AnonymousSupporterError } from '../../domain/repositories/anonymous-supporter.repository';
import { CauseSupportNotFoundError } from '../../domain/repositories/cause-support.repository';
import { CauseNotFoundError } from '../../domain/repositories/cause.repository';
import { RegisterAnonymousSupportRequestDto } from '../dtos/register-anonymous-support-request.dto';
import { RegisterUserSupportDto } from '../dtos/register-user-support.dto';

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
  abstract registerSupportForUser(
    options: RegisterUserSupportDto,
  ): Promise<Either<RegisterUserSupportError, void>>;

  abstract registerSupportForAnonymous(
    options: RegisterAnonymousSupportRequestDto,
  ): Promise<Either<RegisterAnonymousSupportError, void>>;

  abstract cancelSupport(
    causeId: string,
    userId: string,
  ): Promise<Either<CauseSupportNotFoundError, void>>;
}
