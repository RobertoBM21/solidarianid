import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class CauseAlreadyClosedError extends Error implements DomainError {
  message = 'Cause is already closed.';
}

export class CauseStatus extends ValueObject<boolean> {
  private constructor(isClosed: boolean) {
    super(isClosed);
  }

  isClosed(): boolean {
    return this.props;
  }

  isOpen(): boolean {
    return !this.props;
  }

  close(): Either<CauseAlreadyClosedError, CauseStatus> {
    if (this.isClosed()) {
      return left(new CauseAlreadyClosedError());
    }
    return right(CauseStatus.closed());
  }

  static create(isClosed = false): CauseStatus {
    return new CauseStatus(isClosed);
  }

  static open(): CauseStatus {
    return new CauseStatus(false);
  }

  static closed(): CauseStatus {
    return new CauseStatus(true);
  }
}
