import { DomainEvent } from '@app/shared/domain';

export class MembershipRequestAcceptedEvent extends DomainEvent {
  constructor(
    public readonly communityId: string,
    public readonly userId: string,
  ) {
    super();
  }
}
