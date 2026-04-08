import {
  AggregateRoot,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  InitiativeAlreadyClosedError,
  InitiativeStatus,
} from '../value-objects/initiative-status.vo';
import { VolunteeringAction } from './action.aggregate';
export { InitiativeAlreadyClosedError as CauseAlreadyClosedError } from '../value-objects/initiative-status.vo';

export interface CauseAggrProps {
  status: InitiativeStatus;
  communityId: UniqueEntityID;
}

export class CauseAggr extends AggregateRoot<CauseAggrProps> {
  private constructor(props: CauseAggrProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get closed(): boolean {
    return this.props.status.isClosed();
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

  // TODO: register support

  createVolunteeringAction(): Either<
    InitiativeAlreadyClosedError,
    VolunteeringAction
  > {
    // TODO: Implement me!
    return right(undefined as unknown as VolunteeringAction);
  }

  // TODO: create funding action

  static create(data: {
    id: string;
    closed?: boolean;
    communityId: string;
  }): CauseAggr {
    const props: CauseAggrProps = {
      status: InitiativeStatus.create(data.closed ?? false),
      communityId: UniqueEntityID.create(data.communityId),
    };
    const idObj = UniqueEntityID.create(data.id);
    return new CauseAggr(props, idObj);
  }
}
