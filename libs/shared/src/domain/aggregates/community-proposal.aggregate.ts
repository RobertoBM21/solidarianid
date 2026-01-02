import { AggregateRoot } from '../aggregate';
import { UniqueEntityID } from '../entity';
import { DomainError, Either, left, right } from '../errors';
import { CommunityProposalAccepted } from '../events/community-proposal-accepted.event';
import { CommunityProposalCreated } from '../events/community-proposal-created.event';
import { AcceptedStatus } from '../value-objects/accepted-status.vo';
import {
  CommunityDescription,
  InvalidCommunityDescriptionError,
} from '../value-objects/community-description.vo';
import {
  CommunityName,
  InvalidCommunityNameError,
} from '../value-objects/community-name.vo';
import {
  CreationDate,
  InvalidDateError,
} from '../value-objects/creation-date.vo';

export interface CommunityProposalProps {
  name: CommunityName;
  description: CommunityDescription;
  createdAt: CreationDate;
  requesterId: UniqueEntityID;
  accepted: AcceptedStatus;
}

export type CommunityProposalCreationError =
  | InvalidCommunityNameError
  | InvalidCommunityDescriptionError
  | InvalidDateError;

export class InvalidProposalStateError implements DomainError {
  message = 'The community proposal is already in a final state.';
}

export class CommunityProposal extends AggregateRoot<CommunityProposalProps> {
  private constructor(props: CommunityProposalProps, id?: UniqueEntityID) {
    super(props, id);

    if (id === undefined) {
      const ev = new CommunityProposalCreated(
        this.id.toString(),
        this.name,
        this.description,
        this.props.requesterId.toString(),
      );
      this.addDomainEvent(ev);
    }
  }

  get name(): string {
    return this.props.name.value;
  }

  get description(): string {
    return this.props.description.value;
  }

  get requesterId(): string {
    return this.props.requesterId.toString();
  }

  get accepted(): boolean | null {
    return this.props.accepted.value;
  }

  get createdAt(): Date {
    return this.props.createdAt.value;
  }

  isPending(): boolean {
    return this.props.accepted.isPending;
  }

  setAccepted(accepted: boolean): Either<InvalidProposalStateError, void> {
    if (!this.isPending()) {
      return left(new InvalidProposalStateError());
    }
    this.props.accepted = AcceptedStatus.create(accepted);
    if (accepted) {
      const ev = new CommunityProposalAccepted(
        this.id.toString(),
        this.name,
        this.description,
        this.requesterId,
      );
      this.addDomainEvent(ev);
    }
    return right(undefined);
  }

  static create(
    data: {
      name: string;
      description: string;
      createdAt?: Date | string;
      requesterId: string;
      accepted: boolean | null;
    },
    id?: string,
  ): Either<CommunityProposalCreationError, CommunityProposal> {
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

    const requesterIdObj = UniqueEntityID.create(data.requesterId);

    const acceptedStatus = AcceptedStatus.create(data.accepted);

    const idObj: UniqueEntityID | undefined = id
      ? UniqueEntityID.create(id)
      : undefined;

    const props: CommunityProposalProps = {
      name: nameOrError.value,
      description: descriptionOrError.value,
      createdAt: createdAtOrError.value,
      requesterId: requesterIdObj,
      accepted: acceptedStatus,
    };
    const proposal = new CommunityProposal(props, idObj);

    return right(proposal);
  }
}
