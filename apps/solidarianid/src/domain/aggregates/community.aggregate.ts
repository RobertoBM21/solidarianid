import {
  AggregateRoot,
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
import { AdminsList } from '../value-objects/admins-list.vo';

export interface CommunityProps {
  name: CommunityName;
  description: CommunityDescription;
  createdAt: CreationDate;
  admins: AdminsList;
}

export type CommunityCreationError =
  | InvalidCommunityNameError
  | InvalidCommunityDescriptionError
  | InvalidDateError;

export class Community extends AggregateRoot<CommunityProps> {
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

  static create(
    data: {
      name: string;
      description: string;
      createdAt?: Date | string;
      admins: string[];
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

    const idObj: UniqueEntityID | undefined = id
      ? UniqueEntityID.create(id)
      : undefined;

    const props: CommunityProps = {
      name: nameOrError.value,
      description: descriptionOrError.value,
      createdAt: createdAtOrError.value,
      admins: adminsListOrError.value,
    };
    return right(new Community(props, idObj));
  }
}
