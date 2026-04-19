import {
  Either,
  Entity,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  CreationDate,
  InvalidDateError,
} from '@app/shared/domain/value-objects/creation-date.vo';
import {
  InitiativeAlreadyClosedError,
  InitiativeStatus,
} from '@app/shared/domain/value-objects/initiative-status.vo';
import {
  InvalidMoneyAmountError,
  MoneyAmount,
} from '@app/shared/domain/value-objects/money-amount.vo';
import {
  InvalidTitleError,
  Title,
} from '@app/shared/domain/value-objects/title.vo';
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

export interface ActionDefProps {
  title: Title;
  description: Description;
  objectives: ActionObjectives;
  status: InitiativeStatus;
  createdAt: CreationDate;
  causeId: UniqueEntityID;
}

export interface VolunteeringActionDefProps extends ActionDefProps {
  schedule: ActionSchedule;
}

export interface FundingActionDefProps extends ActionDefProps {
  targetAmount: MoneyAmount;
}

export type VolunteeringActionDefCreationError =
  | InvalidTitleError
  | InvalidDescriptionError
  | InvalidActionObjectivesError
  | InvalidActionScheduleError
  | InvalidDateError;

export type FundingActionDefCreationError =
  | InvalidTitleError
  | InvalidDescriptionError
  | InvalidActionObjectivesError
  | InvalidMoneyAmountError
  | InvalidDateError;

export type ActionDefCreationError =
  | VolunteeringActionDefCreationError
  | FundingActionDefCreationError;

abstract class ActionDef<
  P extends ActionDefProps = ActionDefProps,
> extends Entity<P> {
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

  close(): Either<InitiativeAlreadyClosedError, void> {
    const statusOrError = this.props.status.close();
    if (statusOrError.isLeft()) {
      return left(statusOrError.value);
    }
    this.props.status = statusOrError.value;
    return right(undefined);
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
    ActionDefProps
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

export class VolunteeringActionDef extends ActionDef<VolunteeringActionDefProps> {
  private constructor(props: VolunteeringActionDefProps, id?: UniqueEntityID) {
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
  ): Either<VolunteeringActionDefCreationError, VolunteeringActionDef> {
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
    return right(new VolunteeringActionDef(props, idObj));
  }
}

export class FundingActionDef extends ActionDef<FundingActionDefProps> {
  private constructor(props: FundingActionDefProps, id?: UniqueEntityID) {
    super(props, id);
  }

  readonly type = 'funding';

  get targetAmountValue(): number {
    return this.props.targetAmount.value;
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
    },
    id?: string,
  ): Either<FundingActionDefCreationError, FundingActionDef> {
    const commonPropsOrError = this.buildCommonProps(data);
    if (commonPropsOrError.isLeft()) {
      return left(commonPropsOrError.value);
    }

    const targetAmountOrError = MoneyAmount.create(data.targetAmount);
    if (targetAmountOrError.isLeft()) {
      return left(targetAmountOrError.value);
    }

    const props = {
      ...commonPropsOrError.value,
      targetAmount: targetAmountOrError.value,
    };

    const idObj = id ? UniqueEntityID.create(id) : undefined;
    return right(new FundingActionDef(props, idObj));
  }
}

export type ActionDefEntity = VolunteeringActionDef | FundingActionDef;
