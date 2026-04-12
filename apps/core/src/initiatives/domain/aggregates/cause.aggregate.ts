import {
  AggregateRoot,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  InvalidTitleError,
  Title,
} from '@app/shared/domain/value-objects/title.vo';
import { CauseSupportRegisteredEvent } from '../events/cause-support-registered.event';
import { FundingActionCreatedEvent } from '../events/funding-action-created.event';
import { VolunteeringActionCreatedEvent } from '../events/volunteering-action-created.event';
import {
  InitiativeAlreadyClosedError,
  InitiativeStatus,
} from '../value-objects/initiative-status.vo';
import { Supporter } from '../value-objects/supporter.vo';
import {
  FundingAction,
  FundingActionCreationError,
  VolunteeringAction,
  VolunteeringActionCreationError,
} from './action.aggregate';
export { InitiativeAlreadyClosedError as CauseAlreadyClosedError } from '../value-objects/initiative-status.vo';

export interface CauseAggrProps {
  title: Title;
  status: InitiativeStatus;
  communityId: UniqueEntityID;
}

export class CauseAggr extends AggregateRoot<CauseAggrProps> {
  private constructor(props: CauseAggrProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get title(): string {
    return this.props.title.value;
  }

  get closed(): boolean {
    return this.props.status.isClosed();
  }

  get communityId(): UniqueEntityID {
    return this.props.communityId;
  }

  close(): Either<InitiativeAlreadyClosedError, void> {
    const statusOrError = this.props.status.close();
    if (statusOrError.isLeft()) {
      return left(statusOrError.value);
    }
    this.props.status = statusOrError.value;
    return right(undefined);
  }

  registerSupport(
    supporter: Supporter,
  ): Either<InitiativeAlreadyClosedError, void> {
    if (this.closed) {
      return left(new InitiativeAlreadyClosedError());
    }
    this.addDomainEvent(
      new CauseSupportRegisteredEvent(
        this.id.toString(),
        supporter.isUser() ? 'user' : 'anonymous',
        supporter.id.toString(),
      ),
    );
    return right(undefined);
  }

  createVolunteeringAction(data: {
    title: string;
    description: string;
    objectives: string[];
    start: Date | string;
    end: Date | string;
  }): Either<
    InitiativeAlreadyClosedError | VolunteeringActionCreationError,
    VolunteeringAction
  > {
    if (this.closed) {
      return left(new InitiativeAlreadyClosedError());
    }
    const actionOrError = VolunteeringAction.create({
      ...data,
      causeId: this.id.toString(),
    });
    if (actionOrError.isLeft()) {
      return left(actionOrError.value);
    }
    const action = actionOrError.value;
    this.addDomainEvent(
      new VolunteeringActionCreatedEvent(
        action.id.toString(),
        action.title,
        action.description,
        [...action.objectives],
        this.id.toString(),
        action.start,
        action.end,
      ),
    );
    return right(action);
  }

  createFundingAction(data: {
    title: string;
    description: string;
    objectives: string[];
    targetAmount: number;
  }): Either<
    InitiativeAlreadyClosedError | FundingActionCreationError,
    FundingAction
  > {
    if (this.closed) {
      return left(new InitiativeAlreadyClosedError());
    }
    const actionOrError = FundingAction.create({
      ...data,
      causeId: this.id.toString(),
    });
    if (actionOrError.isLeft()) {
      return left(actionOrError.value);
    }
    const action = actionOrError.value;
    this.addDomainEvent(
      new FundingActionCreatedEvent(
        action.id.toString(),
        action.title,
        action.description,
        [...action.objectives],
        this.id.toString(),
        action.targetAmountValue,
      ),
    );
    return right(action);
  }

  static create(data: {
    id: string;
    title: string;
    closed?: boolean;
    communityId: string;
  }): Either<InvalidTitleError, CauseAggr> {
    const titleOrError = Title.create(data.title);
    if (titleOrError.isLeft()) {
      return left(titleOrError.value);
    }

    const props: CauseAggrProps = {
      title: titleOrError.value,
      status: InitiativeStatus.create(data.closed ?? false),
      communityId: UniqueEntityID.create(data.communityId),
    };
    const idObj = UniqueEntityID.create(data.id);
    return right(new CauseAggr(props, idObj));
  }
}
