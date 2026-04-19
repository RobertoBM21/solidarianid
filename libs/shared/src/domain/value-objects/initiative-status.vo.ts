import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InitiativeAlreadyClosedError implements DomainError {
  message = 'Initiative is already closed.';
}

export class InitiativeStatus extends ValueObject<boolean> {
  private constructor(isClosed: boolean) {
    super(isClosed);
  }

  isClosed(): boolean {
    return this.props;
  }

  isOpen(): boolean {
    return !this.props;
  }

  close(): Either<InitiativeAlreadyClosedError, InitiativeStatus> {
    if (this.isClosed()) {
      return left(new InitiativeAlreadyClosedError());
    }
    return right(InitiativeStatus.closed());
  }

  static create(isClosed = false): InitiativeStatus {
    return new InitiativeStatus(isClosed);
  }

  static open(): InitiativeStatus {
    return new InitiativeStatus(false);
  }

  static closed(): InitiativeStatus {
    return new InitiativeStatus(true);
  }
}
