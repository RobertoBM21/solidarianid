import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ActionRepository } from '../../domain/repositories/action.repository';
import {
  CauseAggrRepository,
  CauseNotFoundError,
} from '../../domain/repositories/cause-aggr.repository';
import { mapActionToOutDto } from '../dtos/action-out.dto';
import { CauseDto } from '../dtos/cause.dto';
import { CausesPort } from '../ports/causes.port';
import { IsCauseSupportedByUserQuery } from '../queries/is-cause-supported-by-user.query';

@Injectable()
export class CausesService extends CausesPort {
  constructor(
    private readonly causeAggrRepository: CauseAggrRepository,
    private readonly queryBus: QueryBus,
    private readonly actionRepository: ActionRepository,
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
}
