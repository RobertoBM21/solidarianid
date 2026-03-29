import {
  AggregateRoot,
  DomainError,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { AcceptedStatus } from '@app/shared/domain/value-objects/accepted-status.vo';
import {
  CreationDate,
  InvalidDateError,
} from '@app/shared/domain/value-objects/creation-date.vo';
import { MembershipRequestAcceptedEvent } from './events/membership-request-accepted.event';

export class MembershipRequestAlreadyExistsError implements DomainError {
  readonly message: string = 'A membership request already exists';
}

export class UserAlreadyMemberError implements DomainError {
  readonly message: string = 'User is already a member of this community';
}

export class MembershipRequestNotPendingError implements DomainError {
  readonly message: string = 'Membership request is not pending';
}

export interface MembershipRequestProps {
  communityId: UniqueEntityID;
  userId: UniqueEntityID;
  accepted: AcceptedStatus;
  createdAt: CreationDate;
}

export type MembershipRequestCreationError = InvalidDateError;

export class MembershipRequest extends AggregateRoot<MembershipRequestProps> {
  private constructor(props: MembershipRequestProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get communityId(): UniqueEntityID {
    return this.props.communityId;
  }

  get userId(): UniqueEntityID {
    return this.props.userId;
  }

  get accepted(): boolean | null {
    return this.props.accepted.value;
  }

  get createdAt(): Date {
    return this.props.createdAt.value;
  }

  accept(): Either<MembershipRequestNotPendingError, void> {
    if (!this.isPending()) {
      return left(new MembershipRequestNotPendingError());
    }
    this.props.accepted = AcceptedStatus.accepted();
    this.addDomainEvent(
      new MembershipRequestAcceptedEvent(
        this.communityId.toString(),
        this.userId.toString(),
      ),
    );
    return right(undefined);
  }

  reject(): Either<MembershipRequestNotPendingError, void> {
    if (!this.isPending()) {
      return left(new MembershipRequestNotPendingError());
    }
    this.props.accepted = AcceptedStatus.rejected();
    return right(undefined);
  }

  isPending(): boolean {
    return this.props.accepted.isPending;
  }

  static create(
    data: {
      communityId: string;
      userId: string;
      accepted?: boolean | null;
      createdAt?: Date | string;
    },
    id?: string,
  ): Either<MembershipRequestCreationError, MembershipRequest> {
    const communityId = UniqueEntityID.create(data.communityId);
    const userId = UniqueEntityID.create(data.userId);

    const accepted = AcceptedStatus.create(data.accepted ?? null);

    const createdAtOrError = CreationDate.create(data.createdAt);
    if (createdAtOrError.isLeft()) {
      return left(createdAtOrError.value);
    }

    const idObj: UniqueEntityID | undefined = id
      ? UniqueEntityID.create(id)
      : undefined;

    const props: MembershipRequestProps = {
      communityId,
      userId,
      accepted,
      createdAt: createdAtOrError.value,
    };
    const membershipRequest = new MembershipRequest(props, idObj);

    return right(membershipRequest);
  }
}
