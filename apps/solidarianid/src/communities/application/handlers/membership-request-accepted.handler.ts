import { EventsHandler } from '@nestjs/cqrs';
import { CommunityMember } from '../../domain/community-member.aggregate';
import { MembershipRequestAcceptedEvent } from '../../domain/events/membership-request-accepted.event';
import { CommunityMemberRepository } from '../../domain/repositories/community-member.repository';

@EventsHandler(MembershipRequestAcceptedEvent)
export class MembershipRequestAcceptedHandler {
  constructor(
    private readonly communityMemberRepository: CommunityMemberRepository,
  ) {}

  async handle(event: MembershipRequestAcceptedEvent): Promise<void> {
    const member = CommunityMember.create({
      communityId: event.communityId,
      userId: event.userId,
      admin: false,
    });

    await this.communityMemberRepository.save(member);
  }
}
