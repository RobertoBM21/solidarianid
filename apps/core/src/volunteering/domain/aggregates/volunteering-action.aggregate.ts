import {
  AggregateRoot,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { InitiativeStatus } from '@app/shared/domain/value-objects/initiative-status.vo';
import {
  InvalidTitleError,
  Title,
} from '@app/shared/domain/value-objects/title.vo';

export interface VolunteeringActionProps {
  title: Title;
  causeId: UniqueEntityID;
  status: InitiativeStatus;
}

export type VolunteeringActionCreationError = InvalidTitleError;

export class VolunteeringAction extends AggregateRoot<VolunteeringActionProps> {
  private constructor(props: VolunteeringActionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get title(): string {
    return this.props.title.value;
  }

  get causeId(): UniqueEntityID {
    return this.props.causeId;
  }

  get closed(): boolean {
    return this.props.status.isClosed();
  }

  close(): void {
    this.props.status = InitiativeStatus.closed();
  }

  static create(
    data: {
      title: string;
      causeId: string;
      closed?: boolean;
    },
    id?: string,
  ): Either<VolunteeringActionCreationError, VolunteeringAction> {
    const titleOrError = Title.create(data.title);
    if (titleOrError.isLeft()) return left(titleOrError.value);

    const props: VolunteeringActionProps = {
      title: titleOrError.value,
      causeId: UniqueEntityID.create(data.causeId),
      status: InitiativeStatus.create(data.closed ?? false),
    };

    const idObj = id ? UniqueEntityID.create(id) : undefined;
    return right(new VolunteeringAction(props, idObj));
  }
}
