import {
  AggregateRoot,
  DomainError,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  CreationDate,
  InvalidDateError,
} from '@app/shared/domain/value-objects/creation-date.vo';
import { MemberRole } from './value-objects/member-role.vo';

export interface CommunityMemberProps {
  communityId: UniqueEntityID;
  userId: UniqueEntityID;
  admin: MemberRole;
  createdAt: CreationDate;
}

export class MemberAlreadyAdminError implements DomainError {
  readonly message: string = 'Member is already an admin';
}

export class CannotExpelAdminError implements DomainError {
  readonly message: string = 'Cannot expel an admin';
}

export class CommunityMember extends AggregateRoot<CommunityMemberProps> {
  private constructor(props: CommunityMemberProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get communityId(): UniqueEntityID {
    return this.props.communityId;
  }

  get userId(): UniqueEntityID {
    return this.props.userId;
  }

  get role(): MemberRole {
    return this.props.admin;
  }

  get createdAt(): Date {
    return this.props.createdAt.value;
  }

  promoteToAdmin(): Either<MemberAlreadyAdminError, void> {
    if (this.role.isAdmin()) {
      return left(new MemberAlreadyAdminError());
    }
    this.props.admin = MemberRole.admin();
    return right(undefined);
  }

  static create(
    data: {
      communityId: string;
      userId: string;
      admin: boolean;
      createdAt?: Date;
    },
    id?: string,
  ): Either<InvalidDateError, CommunityMember> {
    const communityId = UniqueEntityID.create(data.communityId);
    const userId = UniqueEntityID.create(data.userId);
    const admin = MemberRole.create(data.admin);

    const dateOrError = CreationDate.create(data.createdAt);
    if (dateOrError.isLeft()) {
      return left(dateOrError.value);
    }

    const idObj = id ? UniqueEntityID.create(id) : undefined;

    const props: CommunityMemberProps = {
      communityId,
      userId,
      admin,
      createdAt: dateOrError.value,
    };
    const communityMember = new CommunityMember(props, idObj);
    return right(communityMember);
  }
}
