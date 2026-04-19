import {
  AggregateRoot,
  DomainError,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  InvalidVolunteeringDateError,
  VolunteeringDate,
} from '@app/shared/domain/value-objects/volunteering-date.vo';

export interface VolunteerLogProps {
  volunteerId: UniqueEntityID;
  volunteeringActionId: UniqueEntityID;
  start: VolunteeringDate;
  end: VolunteeringDate;
}

export class InvalidDateRangeError implements DomainError {
  public readonly message: string = 'Start date must be before end date';
}

export class CancellationTooLateError implements DomainError {
  readonly message: string =
    'Cannot cancel participation that has already started.';
}

export type VolunteerLogCancellationError = CancellationTooLateError;

export type VolunteerLogCreationError =
  | InvalidVolunteeringDateError
  | InvalidDateRangeError;

export class VolunteerLogNotOwnedError implements DomainError {
  public readonly message: string =
    'The volunteer log does not belong to the user';
}

export class VolunteerLog extends AggregateRoot<VolunteerLogProps> {
  private constructor(props: VolunteerLogProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get volunteerId(): string {
    return this.props.volunteerId.toString();
  }

  get volunteeringActionId(): string {
    return this.props.volunteeringActionId.toString();
  }

  get start(): Date {
    return this.props.start.value;
  }

  get end(): Date {
    return this.props.end.value;
  }

  public canCancel(
    userId: string,
  ): Either<VolunteerLogCancellationError, void> {
    if (this.volunteerId !== userId) {
      return left(new VolunteerLogNotOwnedError());
    }

    const now = new Date();
    if (now >= this.start) {
      return left(new CancellationTooLateError());
    }
    return right(undefined);
  }

  static create(
    data: {
      volunteerId: string;
      volunteeringActionId: string;
      start: Date;
      end: Date;
    },
    id?: UniqueEntityID,
  ): Either<VolunteerLogCreationError, VolunteerLog> {
    const volunteerId = UniqueEntityID.create(data.volunteerId);
    const volunteeringActionId = UniqueEntityID.create(
      data.volunteeringActionId,
    );

    const startOrError = VolunteeringDate.create(data.start);
    if (startOrError.isLeft()) {
      return left(startOrError.value);
    }

    const endOrError = VolunteeringDate.create(data.end);
    if (endOrError.isLeft()) {
      return left(endOrError.value);
    }

    if (startOrError.value.value >= endOrError.value.value) {
      return left(new InvalidDateRangeError());
    }

    const props: VolunteerLogProps = {
      volunteerId,
      volunteeringActionId,
      start: startOrError.value,
      end: endOrError.value,
    };

    return right(new VolunteerLog(props, id));
  }
}
