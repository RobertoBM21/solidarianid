import {
  AggregateRoot,
  DomainError,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  CommunityDescription,
  InvalidCommunityDescriptionError,
} from '@app/shared/domain/value-objects/community-description.vo';
import {
  CommunityName,
  InvalidCommunityNameError,
} from '@app/shared/domain/value-objects/community-name.vo';
import {
  CreationDate,
  InvalidDateError,
} from '@app/shared/domain/value-objects/creation-date.vo';
import { InitiativeAlreadyClosedError } from '@app/shared/domain/value-objects/initiative-status.vo';
import { Cause } from './entities/cause.entity';
import { CauseClosedEvent } from './events/cause-closed.event';
import { CauseCreatedEvent } from './events/cause-created.event';
import {
  AdminsList,
  InvalidAdminsListError,
} from './value-objects/admins-list.vo';
import {
  CausesList,
  InvalidCausesListError,
} from './value-objects/causes-list.vo';

export interface CommunityProps {
  name: CommunityName;
  description: CommunityDescription;
  createdAt: CreationDate;
  admins: AdminsList;
  causes: CausesList;
}

export type CommunityCreationError =
  | InvalidCommunityNameError
  | InvalidCommunityDescriptionError
  | InvalidDateError
  | InvalidCausesListError
  | InvalidAdminsListError;

export class CommunityNameAlreadyExistsError implements DomainError {
  readonly message: string;
  constructor(public readonly name: string) {
    this.message = `Community name "${name}" already exists.`;
  }
}

export class UserIsNotAdminError implements DomainError {
  readonly message: string;
  constructor(public readonly communityId: string) {
    this.message = `User is not an admin of community ${communityId}`;
  }
}
export type CloseCauseError =
  | UserIsNotAdminError
  | InvalidCausesListError
  | InitiativeAlreadyClosedError;

export class Community extends AggregateRoot<CommunityProps> {
  private constructor(props: CommunityProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get name(): string {
    return this.props.name.value;
  }

  get description(): string {
    return this.props.description.value;
  }

  get createdAt(): Date {
    return this.props.createdAt.value;
  }

  get admins(): AdminsList {
    return this.props.admins;
  }

  get causes(): Cause[] {
    return [...this.props.causes.value];
  }

  addCause(
    causeProps: {
      title: string;
      description: string;
      duration: string;
      ods: number;
    },
    requesterId: UniqueEntityID,
  ): Either<UserIsNotAdminError | InvalidCausesListError, Cause> {
    if (!this.props.admins.has(requesterId)) {
      return left(new UserIsNotAdminError(this.id.toString()));
    }
    const causeEither = Cause.create(causeProps);
    if (causeEither.isLeft()) {
      return left(causeEither.value);
    }
    const cause = causeEither.value;
    const updatedCauses = this.props.causes.withAdded(cause);
    if (updatedCauses.isLeft()) {
      return left(updatedCauses.value);
    }
    this.props.causes = updatedCauses.value;
    this.addDomainEvent(
      new CauseCreatedEvent(
        cause.id.toString(),
        cause.title,
        this.id.toString(),
      ),
    );
    return right(cause);
  }

  getCause(causeId: UniqueEntityID): Cause | undefined {
    return this.props.causes.getCause(causeId);
  }

  closeCause(
    causeId: UniqueEntityID,
    requesterId: UniqueEntityID,
  ): Either<CloseCauseError, void> {
    if (!this.props.admins.has(requesterId)) {
      return left(new UserIsNotAdminError(this.id.toString()));
    }
    const cause = this.props.causes.getCause(causeId);
    if (!cause) {
      return left(new InvalidCausesListError('Cause not found'));
    }
    const closedOrError = cause.close();
    if (closedOrError.isLeft()) {
      return left(closedOrError.value);
    }
    this.addDomainEvent(new CauseClosedEvent(cause.id.toString()));
    return right(undefined);
  }

  static create(
    data: {
      name: string;
      description: string;
      createdAt?: Date | string;
      admins: string[];
      causes?: Cause[];
    },
    id?: string,
  ): Either<CommunityCreationError, Community> {
    const nameOrError = CommunityName.create(data.name);
    if (nameOrError.isLeft()) {
      return left(nameOrError.value);
    }

    const descriptionOrError = CommunityDescription.create(data.description);
    if (descriptionOrError.isLeft()) {
      return left(descriptionOrError.value);
    }

    const createdAtOrError = CreationDate.create(data.createdAt);
    if (createdAtOrError.isLeft()) {
      return left(createdAtOrError.value);
    }

    const adminsListOrError = AdminsList.create(data.admins);
    if (adminsListOrError.isLeft()) {
      return left(adminsListOrError.value);
    }

    const causesListOrError = CausesList.create(data.causes ?? []);
    if (causesListOrError.isLeft()) {
      return left(causesListOrError.value);
    }

    const idObj: UniqueEntityID | undefined = id
      ? UniqueEntityID.create(id)
      : undefined;

    const props: CommunityProps = {
      name: nameOrError.value,
      description: descriptionOrError.value,
      createdAt: createdAtOrError.value,
      admins: adminsListOrError.value,
      causes: causesListOrError.value,
    };
    return right(new Community(props, idObj));
  }
}
