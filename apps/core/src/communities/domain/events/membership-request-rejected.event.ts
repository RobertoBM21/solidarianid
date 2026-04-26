import { DomainEvent } from '@app/shared/domain';

export class MembershipRequestRejectedEvent extends DomainEvent {
  constructor(
    public readonly communityId: string,
    public readonly userId: string,
  ) {
    super();
  }
}
