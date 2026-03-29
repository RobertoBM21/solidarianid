import {
  AggregateRoot,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  CreationDate,
  InvalidDateError,
} from '@app/shared/domain/value-objects/creation-date.vo';
import { Supporter } from '../value-objects/supporter.vo';

export interface CauseSupportProps {
  causeId: UniqueEntityID;
  supporter: Supporter;
  date: CreationDate;
}

export type CauseSupportCreationError = InvalidDateError;

export class CauseSupport extends AggregateRoot<CauseSupportProps> {
  private constructor(props: CauseSupportProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get causeId(): UniqueEntityID {
    return this.props.causeId;
  }

  get supporter(): Supporter {
    return this.props.supporter;
  }

  get date(): Date {
    return this.props.date.value;
  }

  static create(
    data: {
      causeId: string;
      supporter: Supporter;
      date?: Date | string;
    },
    id?: string,
  ): Either<CauseSupportCreationError, CauseSupport> {
    const dateOrError = CreationDate.create(data.date);
    if (dateOrError.isLeft()) {
      return left(dateOrError.value);
    }

    const props: CauseSupportProps = {
      causeId: UniqueEntityID.create(data.causeId),
      supporter: data.supporter,
      date: dateOrError.value,
    };

    const idObj = id ? UniqueEntityID.create(id) : undefined;
    return right(new CauseSupport(props, idObj));
  }
}
