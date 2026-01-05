import {
  DomainEventsPort,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { Cause } from '../../domain/aggregates/cause.aggregate';
import {
  CausesServicePort,
  CloseCauseError,
  CreateCauseError,
} from '../../domain/ports/causes.service.port';
import {
  CauseNotFoundError,
  CausesRepository,
} from '../../domain/repositories/causes.repository';
import {
  CommunitiesRepository,
  CommunityNotFoundError,
} from '../../domain/repositories/communities.repository';
import { CauseOutDto } from '../dtos/cause-out.dto';

@Injectable()
export class CausesService extends CausesServicePort {
  constructor(
    private readonly causesRepository: CausesRepository,
    private readonly communitiesRepository: CommunitiesRepository,
    private readonly domainEvents: DomainEventsPort,
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
    const exists = await this.communitiesRepository.exists(
      UniqueEntityID.create(communityId),
    );
    if (!exists) {
      return left(new CommunityNotFoundError(communityId));
    }

    const causeOrError = Cause.create({ ...data, communityId });
    if (causeOrError.isLeft()) {
      return left(causeOrError.value);
    }
    const cause = causeOrError.value;

    await this.causesRepository.save(cause);
    await this.domainEvents.dispatch(cause);
    return right(new CauseOutDto(cause));
  }

  async getCause(
    communityId: string,
    causeId: string,
  ): Promise<Either<CauseNotFoundError, CauseOutDto>> {
    const causeResult = await this.causesRepository.findByIdAndCommunity(
      UniqueEntityID.create(causeId),
      UniqueEntityID.create(communityId),
    );
    if (causeResult.isLeft()) {
      return left(causeResult.value);
    }
    const cause = causeResult.value;
    return right(new CauseOutDto(cause));
  }

  async closeCause(
    communityId: string,
    causeId: string,
  ): Promise<Either<CloseCauseError, void>> {
    const causeResult = await this.causesRepository.findByIdAndCommunity(
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
    await this.causesRepository.save(cause);
    return right(undefined);
  }

  async listByCommunity(
    communityId: string,
  ): Promise<Either<CommunityNotFoundError, CauseOutDto[]>> {
    const communityResult = await this.communitiesRepository.findById(
      UniqueEntityID.create(communityId),
    );
    if (communityResult.isLeft()) {
      return left(communityResult.value);
    }

    const causes = await this.causesRepository.listByCommunity(
      UniqueEntityID.create(communityId),
    );
    return right(causes.map((cause) => new CauseOutDto(cause)));
  }
}
