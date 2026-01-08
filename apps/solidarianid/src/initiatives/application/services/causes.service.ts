import {
  DomainEventsPort,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetCommunityExistsQuery } from '../../../communities/application/queries/get-community-exists.query';
import { CommunityNotFoundError } from '../../../communities/domain/repositories/community.repository';
import { Cause } from '../../domain/aggregates/cause.aggregate';
import {
  CausesServicePort,
  CloseCauseError,
  CreateCauseError,
} from '../../domain/ports/causes.port';
import { ActionRepository } from '../../domain/repositories/action.repository';
import {
  CauseNotFoundError,
  CauseRepository,
} from '../../domain/repositories/cause.repository';
import { mapActionToOutDto } from '../dtos/action-out.dto';
import { CauseOutDto } from '../dtos/cause-out.dto';

@Injectable()
export class CausesService extends CausesServicePort {
  constructor(
    private readonly causeRepository: CauseRepository,
    private readonly domainEvents: DomainEventsPort,
    private readonly queryBus: QueryBus,
    private readonly actionRepository: ActionRepository,
  ) {
    super();
  }

  async createCause(
    communityId: string,
    data: {
      title: string;
      description: string;
      duration: string;
      ods: number;
    },
  ): Promise<Either<CreateCauseError, CauseOutDto>> {
    const exists = await this.queryBus.execute(
      new GetCommunityExistsQuery(UniqueEntityID.create(communityId)),
    );
    if (!exists) {
      return left(new CommunityNotFoundError(communityId));
    }

    const causeOrError = Cause.create({ ...data, communityId });
    if (causeOrError.isLeft()) {
      return left(causeOrError.value);
    }
    const cause = causeOrError.value;

    await this.causeRepository.save(cause);
    await this.domainEvents.dispatch(cause);
    return right(new CauseOutDto(cause));
  }

  async getCause(
    communityId: string,
    causeId: string,
  ): Promise<Either<CauseNotFoundError, CauseOutDto>> {
    const causeResult = await this.causeRepository.findByIdAndCommunity(
      UniqueEntityID.create(causeId),
      UniqueEntityID.create(communityId),
    );
    if (causeResult.isLeft()) {
      return left(causeResult.value);
    }
    const cause = causeResult.value;
    const actions = await this.actionRepository.listByCause(cause.id);
    const actionDtos = actions.map((action) => mapActionToOutDto(action));
    return right(new CauseOutDto(cause, actionDtos));
  }

  async closeCause(
    communityId: string,
    causeId: string,
  ): Promise<Either<CloseCauseError, void>> {
    const causeResult = await this.causeRepository.findByIdAndCommunity(
      UniqueEntityID.create(causeId),
      UniqueEntityID.create(communityId),
    );
    if (causeResult.isLeft()) {
      return left(causeResult.value);
    }
    const cause = causeResult.value;
    const closedOrError = cause.close();
    if (closedOrError.isLeft()) {
      return left(closedOrError.value);
    }
    await this.causeRepository.save(cause);
    return right(undefined);
  }

  async listByCommunity(
    communityId: string,
  ): Promise<Either<CommunityNotFoundError, CauseOutDto[]>> {
    const communityExists = await this.queryBus.execute(
      new GetCommunityExistsQuery(UniqueEntityID.create(communityId)),
    );
    if (!communityExists) {
      return left(new CommunityNotFoundError(communityId));
    }

    const causes = await this.causeRepository.listByCommunity(
      UniqueEntityID.create(communityId),
    );
    return right(causes.map((cause) => new CauseOutDto(cause)));
  }
}
