import { EventsHandler } from '@nestjs/cqrs';
import { MembershipRequestRejectedEvent } from '../../domain/events/membership-request-rejected.event';
import { MembershipNotificationsPort } from '../ports/membership-notifications.port';

@EventsHandler(MembershipRequestRejectedEvent)
export class MembershipRequestRejectedHandler {
  constructor(
    private readonly membershipNotificationsPort: MembershipNotificationsPort,
  ) {}

  handle(event: MembershipRequestRejectedEvent): Promise<void> {
    return this.membershipNotificationsPort.sendMembershipRejected(
      event.userId,
      event.communityId,
    );
  }
}
