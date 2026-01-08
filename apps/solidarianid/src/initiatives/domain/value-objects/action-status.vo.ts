import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class ActionAlreadyClosedError extends Error implements DomainError {
  message = 'Action is already closed.';
}

export class ActionStatus extends ValueObject<boolean> {
  private constructor(isClosed: boolean) {
    super(isClosed);
  }

  isClosed(): boolean {
    return this.props;
  }

  isOpen(): boolean {
    return !this.props;
  }

  close(): Either<ActionAlreadyClosedError, ActionStatus> {
    if (this.isClosed()) {
      return left(new ActionAlreadyClosedError());
    }
    return right(ActionStatus.closed());
  }

  static create(isClosed = false): ActionStatus {
    return new ActionStatus(isClosed);
  }

  static open(): ActionStatus {
    return new ActionStatus(false);
  }

  static closed(): ActionStatus {
    return new ActionStatus(true);
  }
}
