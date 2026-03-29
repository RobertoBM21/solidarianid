import {
  DomainEventsPort,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserExistsQuery } from '../../../identity/application/queries/get-user-exists.query';
import { UserNotFoundError } from '../../../identity/domain/repositories/user.repository';
import { CauseSupport } from '../../domain/aggregates/cause-support.aggregate';
import { AnonymousSupporterRepository } from '../../domain/repositories/anonymous-supporter.repository';
import {
  CauseSupportNotFoundError,
  CauseSupportRepository,
} from '../../domain/repositories/cause-support.repository';
import { CauseRepository } from '../../domain/repositories/cause.repository';
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
    private readonly causeRepository: CauseRepository,
    private readonly causeSupportRepository: CauseSupportRepository,
    private readonly anonymousSupporters: AnonymousSupporterRepository,
    private readonly domainEvents: DomainEventsPort,
    private readonly queryBus: QueryBus,
  ) {
    super();
  }

  async registerSupportForUser(
    options: RegisterUserSupportDto,
  ): Promise<Either<RegisterUserSupportError, void>> {
    const userExists = await this.queryBus.execute(
      new GetUserExistsQuery(UniqueEntityID.create(options.userId)),
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
    const causeResult = await this.causeRepository.findById(
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

    const supportOrError = CauseSupport.create({ causeId, supporter });
    if (supportOrError.isLeft()) {
      return left(supportOrError.value);
    }

    await this.causeSupportRepository.save(supportOrError.value);
    await this.domainEvents.dispatch(supportOrError.value);
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
