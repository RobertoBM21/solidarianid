import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { CommunityMember } from '../../domain/community-member.aggregate';
import { MembershipRequestAcceptedEvent } from '../../domain/events/membership-request-accepted.event';
import { CommunityMemberRepository } from '../../domain/repositories/community-member.repository';

@EventsHandler(MembershipRequestAcceptedEvent)
export class MembershipRequestAcceptedHandler {
  private readonly logger = new Logger(MembershipRequestAcceptedHandler.name);

  constructor(
    private readonly communityMemberRepository: CommunityMemberRepository,
  ) {}

  async handle(event: MembershipRequestAcceptedEvent): Promise<void> {
    const memberOrError = CommunityMember.create({
      communityId: event.communityId,
      userId: event.userId,
      admin: false,
    });
    if (memberOrError.isLeft()) {
      this.logger.error(
        `Failed to create CommunityMember for communityId: ${event.communityId} and userId: ${event.userId}`,
      );
      return;
    }
    const member = memberOrError.value;
    await this.communityMemberRepository.save(member);
  }
}
