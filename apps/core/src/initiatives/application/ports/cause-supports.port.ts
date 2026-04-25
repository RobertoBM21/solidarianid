import { DomainError, Either } from '@app/shared/domain';
import { InvalidDateError } from '@app/shared/domain/value-objects/creation-date.vo';
import { InitiativeAlreadyClosedError } from '@app/shared/domain/value-objects/initiative-status.vo';
import { AnonymousSupporterError } from '../../domain/repositories/anonymous-supporter.repository';
import { CauseNotFoundError } from '../../domain/repositories/cause-aggr.repository';
import { CauseSupportNotFoundError } from '../../domain/repositories/cause-support.repository';
import { RegisterAnonymousSupportDto } from '../dtos/register-anonymous-support.dto';

export class AlreadySupportingError implements DomainError {
  message = 'Support already registered for this cause and supporter.';
}

export class SupporterNotFoundError implements DomainError {
  message: string;
  constructor(public readonly supporterId: string) {
    this.message = `Supporter with ID ${supporterId} not found.`;
  }
}

export type RegisterUserSupportError =
  | CauseNotFoundError
  | AlreadySupportingError
  | SupporterNotFoundError
  | InvalidDateError
  | InitiativeAlreadyClosedError;

export type RegisterAnonymousSupportError =
  | CauseNotFoundError
  | AlreadySupportingError
  | InvalidDateError
  | AnonymousSupporterError
  | InitiativeAlreadyClosedError;

export interface RegisterSupportOutDto {
  supporterId: string;
  supporterName: string;
  createdAt: Date;
}

export abstract class CauseSupportsPort {
  abstract registerSupportForUser(options: {
    causeId: string;
    userId: string;
  }): Promise<Either<RegisterUserSupportError, RegisterSupportOutDto>>;

  abstract registerSupportForAnonymous(
    causeId: string,
    data: RegisterAnonymousSupportDto,
  ): Promise<Either<RegisterAnonymousSupportError, RegisterSupportOutDto>>;

  abstract cancelSupport(
    causeId: string,
    userId: string,
  ): Promise<Either<CauseSupportNotFoundError, void>>;
}
