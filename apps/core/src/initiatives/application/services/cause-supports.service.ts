import {
  DomainEventsPort,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { UserNotFoundError } from '../../../identity/domain/repositories/user.repository';
import { UserCheckerPort } from '../../domain/ports/user-checker.port';
import { AnonymousSupporterRepository } from '../../domain/repositories/anonymous-supporter.repository';
import { CauseAggrRepository } from '../../domain/repositories/cause-aggr.repository';
import {
  CauseSupportNotFoundError,
  CauseSupportRepository,
} from '../../domain/repositories/cause-support.repository';
import {
  AnonymousSupporter,
  Supporter,
  UserSupporter,
} from '../../domain/value-objects/supporter.vo';
import { RegisterAnonymousSupportRequestDto } from '../dtos/register-anonymous-support-request.dto';
import { RegisterUserSupportDto } from '../dtos/register-user-support.dto';
import {
  AlreadySupportingError,
  CauseSupportsPort,
  RegisterAnonymousSupportError,
  RegisterUserSupportError,
} from '../ports/cause-supports.port';

@Injectable()
export class CauseSupportsService extends CauseSupportsPort {
  constructor(
    private readonly causeAggrRepository: CauseAggrRepository,
    private readonly causeSupportRepository: CauseSupportRepository,
    private readonly anonymousSupporters: AnonymousSupporterRepository,
    private readonly domainEvents: DomainEventsPort,
    private readonly userChecker: UserCheckerPort,
  ) {
    super();
  }

  async registerSupportForUser(
    options: RegisterUserSupportDto,
  ): Promise<Either<RegisterUserSupportError, void>> {
    const userExists = await this.userChecker.userExists(
      UniqueEntityID.create(options.userId),
    );
    if (!userExists) {
      return left(new UserNotFoundError(options.userId));
    }
    const supporter = UserSupporter.create(
      UniqueEntityID.create(options.userId),
    );
    return this.registerSupport(options.causeId, supporter);
  }

  async registerSupportForAnonymous(
    options: RegisterAnonymousSupportRequestDto,
  ): Promise<Either<RegisterAnonymousSupportError, void>> {
    const anonIdResult = await this.anonymousSupporters.getOrCreate(
      options.data.name,
      options.data.email,
    );
    if (anonIdResult.isLeft()) {
      return left(anonIdResult.value);
    }
    const supporter = AnonymousSupporter.create(anonIdResult.value);
    return this.registerSupport(options.causeId, supporter);
  }

  private async registerSupport(
    causeId: string,
    supporter: Supporter,
  ): Promise<
    Either<RegisterUserSupportError | RegisterAnonymousSupportError, void>
  > {
    const causeResult = await this.causeAggrRepository.findById(
      UniqueEntityID.create(causeId),
    );
    if (causeResult.isLeft()) {
      return left(causeResult.value);
    }

    const exists = await this.causeSupportRepository.existsForSupporterAndCause(
      supporter,
      UniqueEntityID.create(causeId),
    );
    if (exists) {
      return left(new AlreadySupportingError());
    }

    const causeAggr = causeResult.value;
    const registerOrError = causeAggr.registerSupport(supporter);
    if (registerOrError.isLeft()) {
      return left(registerOrError.value);
    }

    await this.domainEvents.dispatch(causeAggr);
    return right(undefined);
  }

  async cancelSupport(
    causeId: string,
    userId: string,
  ): Promise<Either<CauseSupportNotFoundError, void>> {
    const removal = await this.causeSupportRepository.removeByUserAndCause(
      UniqueEntityID.create(userId),
      UniqueEntityID.create(causeId),
    );
    if (removal.isLeft()) {
      return left(removal.value);
    }
    return right(undefined);
  }
}
