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
  CauseDuration,
  InvalidCauseDurationError,
} from '../value-objects/cause-duration.vo';
import { CauseOds, InvalidCauseOdsError } from '../value-objects/cause-ods.vo';
import {
  Description,
  InvalidDescriptionError,
} from '../value-objects/description.vo';
import {
  InitiativeAlreadyClosedError,
  InitiativeStatus,
} from '../value-objects/initiative-status.vo';
import { InvalidTitleError, Title } from '../value-objects/title.vo';
export { InitiativeAlreadyClosedError as CauseAlreadyClosedError } from '../value-objects/initiative-status.vo';

export interface CauseProps {
  title: Title;
  description: Description;
  duration: CauseDuration;
  ods: CauseOds;
  status: InitiativeStatus;
  createdAt: CreationDate;
  communityId: UniqueEntityID;
}

export type CauseCreationError =
  | InvalidTitleError
  | InvalidDescriptionError
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

  close(): Either<InitiativeAlreadyClosedError, void> {
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
    const titleOrError = Title.create(data.title);
    if (titleOrError.isLeft()) {
      return left(titleOrError.value);
    }

    const descriptionOrError = Description.create(data.description);
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
      status: InitiativeStatus.create(data.closed ?? false),
      createdAt: createdAtOrError.value,
      communityId: UniqueEntityID.create(data.communityId),
    };

    const idObj = id ? UniqueEntityID.create(id) : undefined;
    return right(new Cause(props, idObj));
  }
}
