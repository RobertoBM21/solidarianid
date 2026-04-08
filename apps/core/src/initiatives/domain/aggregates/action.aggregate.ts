import {
  AggregateRoot,
  DomainError,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  CreationDate,
  InvalidDateError,
} from '@app/shared/domain/value-objects/creation-date.vo';
import {
  InvalidMoneyAmountError,
  MoneyAmount,
} from '@app/shared/domain/value-objects/money-amount.vo';
import {
  InvalidTitleError,
  Title,
} from '@app/shared/domain/value-objects/title.vo';
import {
  DonationIntention,
  DonationIntentionCreationError,
} from '../entities/donation-intention.entity';
import {
  ActionCurrentAmount,
  InvalidActionCurrentAmountError,
} from '../value-objects/action-current-amount.vo';
import {
  ActionObjectives,
  InvalidActionObjectivesError,
} from '../value-objects/action-objectives.vo';
import {
  ActionSchedule,
  InvalidActionScheduleError,
} from '../value-objects/action-schedule.vo';
import {
  Description,
  InvalidDescriptionError,
} from '../value-objects/description.vo';
import {
  InitiativeAlreadyClosedError,
  InitiativeStatus,
} from '../value-objects/initiative-status.vo';

export class InvalidActionTypeError implements DomainError {
  message = 'Action type must be volunteering or funding.';
}

export interface ActionProps {
  title: Title;
  description: Description;
  objectives: ActionObjectives;
  status: InitiativeStatus;
  createdAt: CreationDate;
  causeId: UniqueEntityID;
}

export interface VolunteeringActionProps extends ActionProps {
  schedule: ActionSchedule;
}

export interface FundingActionProps extends ActionProps {
  targetAmount: MoneyAmount;
  currentAmount: ActionCurrentAmount;
}

export type VolunteeringActionCreationError =
  | InvalidActionTypeError
  | InvalidTitleError
  | InvalidDescriptionError
  | InvalidActionObjectivesError
  | InvalidActionScheduleError
  | InvalidDateError;

export type FundingActionCreationError =
  | InvalidActionTypeError
  | InvalidTitleError
  | InvalidDescriptionError
  | InvalidActionObjectivesError
  | InvalidMoneyAmountError
  | InvalidActionCurrentAmountError
  | InvalidDateError;

export type ActionCreationError =
  | VolunteeringActionCreationError
  | FundingActionCreationError;

export abstract class Action<
  P extends ActionProps = ActionProps,
> extends AggregateRoot<P> {
  protected constructor(props: P, id?: UniqueEntityID) {
    super(props, id);
  }

  abstract get type(): 'volunteering' | 'funding';

  get title(): string {
    return this.props.title.value;
  }

  get description(): string {
    return this.props.description.value;
  }

  get objectives(): readonly string[] {
    return this.props.objectives.value;
  }

  get closed(): boolean {
    return this.props.status.isClosed();
  }

  get createdAt(): Date {
    return this.props.createdAt.value;
  }

  get causeId(): UniqueEntityID {
    return this.props.causeId;
  }

  protected static buildCommonProps(data: {
    title: string;
    description: string;
    objectives: string[];
    closed?: boolean;
    createdAt?: Date | string;
    causeId: string;
  }): Either<
    | InvalidTitleError
    | InvalidDescriptionError
    | InvalidActionObjectivesError
    | InvalidDateError,
    ActionProps
  > {
    const titleOrError = Title.create(data.title);
    if (titleOrError.isLeft()) {
      return left(titleOrError.value);
    }

    const descriptionOrError = Description.create(data.description);
    if (descriptionOrError.isLeft()) {
      return left(descriptionOrError.value);
    }

    const objectivesOrError = ActionObjectives.create(data.objectives);
    if (objectivesOrError.isLeft()) {
      return left(objectivesOrError.value);
    }

    const createdAtOrError = CreationDate.create(data.createdAt);
    if (createdAtOrError.isLeft()) {
      return left(createdAtOrError.value);
    }

    return right({
      title: titleOrError.value,
      description: descriptionOrError.value,
      objectives: objectivesOrError.value,
      status: InitiativeStatus.create(data.closed ?? false),
      createdAt: createdAtOrError.value,
      causeId: UniqueEntityID.create(data.causeId),
    });
  }
}

export class VolunteeringAction extends Action<VolunteeringActionProps> {
  private constructor(props: VolunteeringActionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  readonly type = 'volunteering';

  get start(): Date {
    return this.props.schedule.start;
  }

  get end(): Date {
    return this.props.schedule.end;
  }

  static create(
    data: {
      title: string;
      description: string;
      objectives: string[];
      closed?: boolean;
      createdAt?: Date | string;
      causeId: string;
      start: Date | string;
      end: Date | string;
    },
    id?: string,
  ): Either<VolunteeringActionCreationError, VolunteeringAction> {
    const commonPropsOrError = this.buildCommonProps(data);
    if (commonPropsOrError.isLeft()) {
      return left(commonPropsOrError.value);
    }

    const scheduleOrError = ActionSchedule.create({
      start: data.start,
      end: data.end,
    });
    if (scheduleOrError.isLeft()) {
      return left(scheduleOrError.value);
    }

    const props = {
      ...commonPropsOrError.value,
      schedule: scheduleOrError.value,
    };

    const idObj = id ? UniqueEntityID.create(id) : undefined;
    return right(new VolunteeringAction(props, idObj));
  }
}

export class FundingAction extends Action<FundingActionProps> {
  private constructor(props: FundingActionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  readonly type = 'funding';

  get targetAmountValue(): number {
    return this.props.targetAmount.value;
  }

  get currentAmountValue(): number {
    return this.props.currentAmount.value;
  }

  requestDonation(
    amount: number,
    donorId: string,
  ): Either<DonationIntentionCreationError, DonationIntention> {
    if (this.closed) {
      return left(new InitiativeAlreadyClosedError());
    }
    return DonationIntention.create({
      fundingActionId: this.id,
      donorId,
      amount,
    });
  }

  incrementTotalDonations(
    amount: number,
  ): Either<InvalidMoneyAmountError, void> {
    const newAmountOrError = this.props.currentAmount.plus(amount);
    if (newAmountOrError.isLeft()) {
      return left(newAmountOrError.value);
    }
    this.props.currentAmount = newAmountOrError.value;
    return right(undefined);
  }

  static create(
    data: {
      title: string;
      description: string;
      objectives: string[];
      closed?: boolean;
      createdAt?: Date | string;
      causeId: string;
      targetAmount: number;
      currentAmount?: number;
    },
    id?: string,
  ): Either<FundingActionCreationError, FundingAction> {
    const commonPropsOrError = this.buildCommonProps(data);
    if (commonPropsOrError.isLeft()) {
      return left(commonPropsOrError.value);
    }

    const targetAmountOrError = MoneyAmount.create(data.targetAmount);
    if (targetAmountOrError.isLeft()) {
      return left(targetAmountOrError.value);
    }

    const currentAmountOrError = ActionCurrentAmount.create(
      data.currentAmount ?? 0,
    );
    if (currentAmountOrError.isLeft()) {
      return left(currentAmountOrError.value);
    }

    const props = {
      ...commonPropsOrError.value,
      targetAmount: targetAmountOrError.value,
      currentAmount: currentAmountOrError.value,
    };

    const idObj = id ? UniqueEntityID.create(id) : undefined;
    return right(new FundingAction(props, idObj));
  }
}
