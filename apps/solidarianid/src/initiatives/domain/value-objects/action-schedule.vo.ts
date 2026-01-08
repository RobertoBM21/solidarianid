import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidActionScheduleError implements DomainError {
  message = 'Action schedule must have a valid start and end date.';
}

export class EndBeforeStartError implements DomainError {
  message = 'Action schedule end date must be after start date.';
}

export class ActionSchedule extends ValueObject<{ start: Date; end: Date }> {
  private constructor(start: Date, end: Date) {
    super({ start, end });
  }

  get start(): Date {
    return this.props.start;
  }

  get end(): Date {
    return this.props.end;
  }

  static create(data: {
    start: Date | string;
    end: Date | string;
  }): Either<InvalidActionScheduleError | EndBeforeStartError, ActionSchedule> {
    if (!data.start || !data.end) {
      return left(new InvalidActionScheduleError());
    }

    const startDate = new Date(data.start);
    const endDate = new Date(data.end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return left(new InvalidActionScheduleError());
    }
    if (endDate <= startDate) {
      return left(new EndBeforeStartError());
    }

    return right(new ActionSchedule(startDate, endDate));
  }
}
