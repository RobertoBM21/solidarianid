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
import { CauseCreated } from '../events/cause-created.event';
import {
  CauseDescription,
  InvalidCauseDescriptionError,
} from '../value-objects/cause-description.vo';
import {
  CauseDuration,
  InvalidCauseDurationError,
} from '../value-objects/cause-duration.vo';
import { CauseOds, InvalidCauseOdsError } from '../value-objects/cause-ods.vo';
import {
  CauseAlreadyClosedError,
  CauseStatus,
} from '../value-objects/cause-status.vo';
import {
  CauseTitle,
  InvalidCauseTitleError,
} from '../value-objects/cause-title.vo';
export { CauseAlreadyClosedError } from '../value-objects/cause-status.vo';

export interface CauseProps {
  title: CauseTitle;
  description: CauseDescription;
  duration: CauseDuration;
  ods: CauseOds;
  status: CauseStatus;
  createdAt: CreationDate;
  communityId: UniqueEntityID;
}

export type CauseCreationError =
  | InvalidCauseTitleError
  | InvalidCauseDescriptionError
  | InvalidCauseDurationError
  | InvalidCauseOdsError
  | InvalidDateError;

export class Cause extends AggregateRoot<CauseProps> {
  private constructor(props: CauseProps, id?: UniqueEntityID) {
    super(props, id);

    if (!id) {
      this.addDomainEvent(
        new CauseCreated(this.id.toString(), this.props.communityId.toString()),
      );
    }
  }

  get title(): string {
    return this.props.title.value;
  }

  get description(): string {
    return this.props.description.value;
  }

  get duration(): string {
    return this.props.duration.value;
  }

  get ods(): number {
    return this.props.ods.value;
  }

  get closed(): boolean {
    return this.props.status.isClosed();
  }

  get createdAt(): Date {
    return this.props.createdAt.value;
  }

  get communityId(): UniqueEntityID {
    return this.props.communityId;
  }

  close(): Either<CauseAlreadyClosedError, void> {
    const statusOrError = this.props.status.close();
    if (statusOrError.isLeft()) {
      return left(statusOrError.value);
    }
    this.props.status = statusOrError.value;
    return right(undefined);
  }

  static create(
    data: {
      title: string;
      description: string;
      duration: string;
      ods: number;
      closed?: boolean;
      createdAt?: Date | string;
      communityId: string;
    },
    id?: string,
  ): Either<CauseCreationError, Cause> {
    const titleOrError = CauseTitle.create(data.title);
    if (titleOrError.isLeft()) {
      return left(titleOrError.value);
    }

    const descriptionOrError = CauseDescription.create(data.description);
    if (descriptionOrError.isLeft()) {
      return left(descriptionOrError.value);
    }

    const durationOrError = CauseDuration.create(data.duration);
    if (durationOrError.isLeft()) {
      return left(durationOrError.value);
    }

    const odsOrError = CauseOds.create(data.ods);
    if (odsOrError.isLeft()) {
      return left(odsOrError.value);
    }

    const createdAtOrError = CreationDate.create(data.createdAt);
    if (createdAtOrError.isLeft()) {
      return left(createdAtOrError.value);
    }

    const props: CauseProps = {
      title: titleOrError.value,
      description: descriptionOrError.value,
      duration: durationOrError.value,
      ods: odsOrError.value,
      status: CauseStatus.create(data.closed ?? false),
      createdAt: createdAtOrError.value,
      communityId: UniqueEntityID.create(data.communityId),
    };

    const idObj = id ? UniqueEntityID.create(id) : undefined;
    return right(new Cause(props, idObj));
  }
}
