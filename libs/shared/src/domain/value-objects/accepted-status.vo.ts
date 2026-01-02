import { ValueObject } from '../value-object';

export class AcceptedStatus extends ValueObject<boolean | null> {
  private constructor(status: boolean | null) {
    super(status);
  }

  get value(): boolean | null {
    return this.props;
  }

  get isAccepted(): boolean {
    return this.props === true;
  }

  get isRejected(): boolean {
    return this.props === false;
  }

  get isPending(): boolean {
    return this.props === null;
  }

  static create(status: boolean | null): AcceptedStatus {
    return new AcceptedStatus(status);
  }

  static accepted(): AcceptedStatus {
    return new AcceptedStatus(true);
  }

  static rejected(): AcceptedStatus {
    return new AcceptedStatus(false);
  }
}
