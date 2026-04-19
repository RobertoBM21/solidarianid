import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { CommunityAuthorizationPort } from '../../domain/ports/community-authz.port';
import {
  CauseAggrRepository,
  CauseNotFoundError,
} from '../../domain/repositories/cause-aggr.repository';
import { CauseSupportRepository } from '../../domain/repositories/cause-support.repository';
import { UserSupporter } from '../../domain/value-objects/supporter.vo';
import { mapActionToOutDto } from '../dtos/action-out.dto';
import { CauseDto } from '../dtos/cause.dto';
import { CauseDataGetterPort } from '../ports/cause-data-getter.port';
import { CausesPort } from '../ports/causes.port';

@Injectable()
export class CausesService extends CausesPort {
  constructor(
    private readonly causeAggrRepository: CauseAggrRepository,
    private readonly causeDataGetter: CauseDataGetterPort,
    private readonly causeSupportsRepository: CauseSupportRepository,
    private readonly communityAuthzPort: CommunityAuthorizationPort,
  ) {
    super();
  }

  async getCause(
    causeId: string,
    userId?: string,
  ): Promise<Either<CauseNotFoundError, CauseDto>> {
    const causeResult = await this.causeAggrRepository.findById(
      UniqueEntityID.create(causeId),
    );
    if (causeResult.isLeft()) {
      return left(causeResult.value);
    }
    const cause = causeResult.value;

    const causeData = await this.causeDataGetter.getCauseData(
      cause.communityId.toString(),
      cause.id.toString(),
    );
    if (!causeData) {
      return left(new CauseNotFoundError(causeId));
    }

    const [supportedByUser, isCommunityAdmin] = await Promise.all([
      this.isCauseSupportedByUser(cause.id, userId),
      this.isCommunityAdmin(cause.communityId.toString(), userId),
    ]);
    const actionDtos = cause.actions.map((action) => mapActionToOutDto(action));

    return right(
      new CauseDto(
        cause,
        causeData,
        supportedByUser,
        isCommunityAdmin,
        actionDtos,
      ),
    );
  }

  private async isCauseSupportedByUser(
    causeId: UniqueEntityID,
    userId?: string,
  ): Promise<boolean | undefined> {
    if (!userId) {
      return undefined;
    }
    const supporter = UserSupporter.create(UniqueEntityID.create(userId));
    return this.causeSupportsRepository.existsForSupporterAndCause(
      supporter,
      causeId,
    );
  }

  private async isCommunityAdmin(
    communityId: string,
    userId?: string,
  ): Promise<boolean | undefined> {
    if (!userId) {
      return undefined;
    }

    return this.communityAuthzPort.canManageCommunity(userId, communityId);
  }
}
