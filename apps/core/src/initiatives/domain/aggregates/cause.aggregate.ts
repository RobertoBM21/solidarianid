import {
  AggregateRoot,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  InitiativeAlreadyClosedError,
  InitiativeStatus,
} from '@app/shared/domain/value-objects/initiative-status.vo';
import {
  InvalidTitleError,
  Title,
} from '@app/shared/domain/value-objects/title.vo';
import {
  ActionDefEntity,
  FundingActionDef,
  FundingActionDefCreationError,
  VolunteeringActionDef,
  VolunteeringActionDefCreationError,
} from '../entities/action.entity';
import { CauseSupportRegisteredEvent } from '../events/cause-support-registered.event';
import { FundingActionCreatedEvent } from '../events/funding-action-created.event';
import { VolunteeringActionCreatedEvent } from '../events/volunteering-action-created.event';
import {
  ActionsList,
  InvalidActionsListError,
} from '../value-objects/actions-list.vo';
import { Supporter } from '../value-objects/supporter.vo';
export { InitiativeAlreadyClosedError as CauseAlreadyClosedError } from '@app/shared/domain/value-objects/initiative-status.vo';

export interface CauseAggrProps {
  title: Title;
  status: InitiativeStatus;
  communityId: UniqueEntityID;
  actions: ActionsList;
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

  get actions(): ActionDefEntity[] {
    return [...this.props.actions.value];
  }

  getAction(actionId: UniqueEntityID): ActionDefEntity | undefined {
    return this.props.actions.getAction(actionId);
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
    | InitiativeAlreadyClosedError
    | VolunteeringActionDefCreationError
    | InvalidActionsListError,
    VolunteeringActionDef
  > {
    if (this.closed) {
      return left(new InitiativeAlreadyClosedError());
    }
    const actionOrError = VolunteeringActionDef.create({
      ...data,
      causeId: this.id.toString(),
    });
    if (actionOrError.isLeft()) {
      return left(actionOrError.value);
    }
    const action = actionOrError.value;
    const updatedActions = this.props.actions.withAdded(action);
    if (updatedActions.isLeft()) {
      return left(updatedActions.value);
    }
    this.props.actions = updatedActions.value;
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
    | InitiativeAlreadyClosedError
    | FundingActionDefCreationError
    | InvalidActionsListError,
    FundingActionDef
  > {
    if (this.closed) {
      return left(new InitiativeAlreadyClosedError());
    }
    const actionOrError = FundingActionDef.create({
      ...data,
      causeId: this.id.toString(),
    });
    if (actionOrError.isLeft()) {
      return left(actionOrError.value);
    }
    const action = actionOrError.value;
    const updatedActions = this.props.actions.withAdded(action);
    if (updatedActions.isLeft()) {
      return left(updatedActions.value);
    }
    this.props.actions = updatedActions.value;
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
    actions?: ActionDefEntity[];
  }): Either<InvalidTitleError | InvalidActionsListError, CauseAggr> {
    const titleOrError = Title.create(data.title);
    if (titleOrError.isLeft()) {
      return left(titleOrError.value);
    }

    const actionsListOrError = ActionsList.create(data.actions ?? []);
    if (actionsListOrError.isLeft()) {
      return left(actionsListOrError.value);
    }

    const props: CauseAggrProps = {
      title: titleOrError.value,
      status: InitiativeStatus.create(data.closed ?? false),
      communityId: UniqueEntityID.create(data.communityId),
      actions: actionsListOrError.value,
    };
    const idObj = UniqueEntityID.create(data.id);
    return right(new CauseAggr(props, idObj));
  }
}
