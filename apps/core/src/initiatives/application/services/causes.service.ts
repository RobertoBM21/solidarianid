import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { ActionRepository } from '../../domain/repositories/action.repository';
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
    private readonly actionRepository: ActionRepository,
    private readonly causeDataGetter: CauseDataGetterPort,
    private readonly causeSupportsRepository: CauseSupportRepository,
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

    const actions = await this.actionRepository.listByCause(cause.id);
    const actionDtos = actions.map((action) => mapActionToOutDto(action));

    const supportedByUser = await this.isCauseSupportedByUser(cause.id, userId);

    const causeData = await this.causeDataGetter.getCauseData(
      cause.communityId.toString(),
      cause.id.toString(),
    );
    if (!causeData) {
      return left(new CauseNotFoundError(causeId));
    }

    return right(new CauseDto(cause, causeData, supportedByUser, actionDtos));
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
}
