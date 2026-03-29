import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidCauseOdsError implements DomainError {
  constructor(public readonly message: string) {}
}

export class CauseOds extends ValueObject<number> {
  private static readonly MIN_ODS = 1;
  private static readonly MAX_ODS = 17;

  private constructor(value: number) {
    super(value);
  }

  get value(): number {
    return this.props;
  }

  static create(ods: number): Either<InvalidCauseOdsError, CauseOds> {
    if (!Number.isInteger(ods) || ods < this.MIN_ODS || ods > this.MAX_ODS) {
      return left(
        new InvalidCauseOdsError('ODS must be an integer between 1 and 17.'),
      );
    }

    return right(new CauseOds(ods));
  }
}
