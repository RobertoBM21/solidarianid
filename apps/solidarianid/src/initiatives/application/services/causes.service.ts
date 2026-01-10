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
import { IsCommunityAdminQuery } from '../../../communities/application/queries/is-community-admin.query';
import { UserIsNotAdminError } from '../../../communities/domain/community.aggregate';
import { CommunityNotFoundError } from '../../../communities/domain/repositories/community.repository';
import { Cause } from '../../domain/aggregates/cause.aggregate';
import { ActionRepository } from '../../domain/repositories/action.repository';
import {
  CauseNotFoundError,
  CauseRepository,
} from '../../domain/repositories/cause.repository';
import { mapActionToOutDto } from '../dtos/action-out.dto';
import { CauseListItemDto } from '../dtos/cause-list-item.dto';
import { CauseDto } from '../dtos/cause.dto';
import {
  CausesPort,
  CloseCauseError,
  CreateCauseData,
  CreateCauseError,
} from '../ports/causes.port';
import { IsCauseSupportedByUserQuery } from '../queries/is-cause-supported-by-user.query';

@Injectable()
export class CausesService extends CausesPort {
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
    data: CreateCauseData,
    userId: string,
  ): Promise<Either<CreateCauseError, { causeId: string }>> {
    const isAdmin = await this.queryBus.execute(
      new IsCommunityAdminQuery(
        UniqueEntityID.create(communityId),
        UniqueEntityID.create(userId),
      ),
    );
    if (!isAdmin) {
      return left(new UserIsNotAdminError(communityId));
    }
    const causeOrError = Cause.create({ ...data, communityId });
    if (causeOrError.isLeft()) {
      return left(causeOrError.value);
    }
    const cause = causeOrError.value;

    await this.causeRepository.save(cause);
    await this.domainEvents.dispatch(cause);
    return right({ causeId: cause.id.toString() });
  }

  async getCause(
    causeId: string,
    userId?: string,
  ): Promise<Either<CauseNotFoundError, CauseDto>> {
    const causeResult = await this.causeRepository.findById(
      UniqueEntityID.create(causeId),
    );
    if (causeResult.isLeft()) {
      return left(causeResult.value);
    }
    const cause = causeResult.value;
    const actions = await this.actionRepository.listByCause(cause.id);
    const actionDtos = actions.map((action) => mapActionToOutDto(action));
    let supportedByUser: boolean | undefined = undefined;
    if (userId) {
      supportedByUser = await this.queryBus.execute(
        new IsCauseSupportedByUserQuery(
          UniqueEntityID.create(causeId),
          UniqueEntityID.create(userId),
        ),
      );
    }
    return right(new CauseDto(cause, supportedByUser, actionDtos));
  }

  async closeCause(
    causeId: string,
    userId: string,
  ): Promise<Either<CloseCauseError, void>> {
    const causeResult = await this.causeRepository.findById(
      UniqueEntityID.create(causeId),
    );
    if (causeResult.isLeft()) {
      return left(causeResult.value);
    }
    const cause = causeResult.value;
    const isAdmin = await this.queryBus.execute(
      new IsCommunityAdminQuery(
        cause.communityId,
        UniqueEntityID.create(userId),
      ),
    );
    if (!isAdmin) {
      return left(new UserIsNotAdminError(cause.communityId.toString()));
    }
    const closedOrError = cause.close();
    if (closedOrError.isLeft()) {
      return left(closedOrError.value);
    }
    await this.causeRepository.save(cause);
    return right(undefined);
  }

  async listByCommunity(
    communityId: string,
  ): Promise<Either<CommunityNotFoundError, CauseListItemDto[]>> {
    const communityExists = await this.queryBus.execute(
      new GetCommunityExistsQuery(UniqueEntityID.create(communityId)),
    );
    if (!communityExists) {
      return left(new CommunityNotFoundError(communityId));
    }

    const causes = await this.causeRepository.listByCommunity(
      UniqueEntityID.create(communityId),
    );
    return right(causes.map((cause) => new CauseListItemDto(cause)));
  }
}
