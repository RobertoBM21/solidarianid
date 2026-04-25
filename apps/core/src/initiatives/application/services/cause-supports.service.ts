import {
  DomainEventsPort,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
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
import { RegisterAnonymousSupportDto } from '../dtos/register-anonymous-support.dto';
import {
  AlreadySupportingError,
  CauseSupportsPort,
  RegisterAnonymousSupportError,
  RegisterSupportOutDto,
  RegisterUserSupportError,
  SupporterNotFoundError,
} from '../ports/cause-supports.port';
import { GetUserPort } from '../ports/get-user.port';

@Injectable()
export class CauseSupportsService extends CauseSupportsPort {
  constructor(
    private readonly causeAggrRepository: CauseAggrRepository,
    private readonly causeSupportRepository: CauseSupportRepository,
    private readonly anonymousSupporters: AnonymousSupporterRepository,
    private readonly domainEvents: DomainEventsPort,
    private readonly getUserPort: GetUserPort,
  ) {
    super();
  }

  async registerSupportForUser(options: {
    causeId: string;
    userId: string;
  }): Promise<Either<RegisterUserSupportError, RegisterSupportOutDto>> {
    const user = await this.getUserPort.getUser(options.userId);
    if (!user) {
      return left(new SupporterNotFoundError(options.userId));
    }
    const supporter = UserSupporter.create(
      UniqueEntityID.create(options.userId),
    );
    return this.registerSupport(options.causeId, supporter, user.name);
  }

  async registerSupportForAnonymous(
    causeId: string,
    data: RegisterAnonymousSupportDto,
  ): Promise<Either<RegisterAnonymousSupportError, RegisterSupportOutDto>> {
    const anonIdResult = await this.anonymousSupporters.getOrCreate(
      data.name,
      data.email,
    );
    if (anonIdResult.isLeft()) {
      return left(anonIdResult.value);
    }
    const supporter = AnonymousSupporter.create(anonIdResult.value);
    return this.registerSupport(causeId, supporter, data.name);
  }

  private async registerSupport(
    causeId: string,
    supporter: Supporter,
    supporterName: string,
  ): Promise<
    Either<
      RegisterUserSupportError | RegisterAnonymousSupportError,
      RegisterSupportOutDto
    >
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
    return right({
      supporterId: supporter.id.toString(),
      supporterName,
      createdAt: new Date(),
    });
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
