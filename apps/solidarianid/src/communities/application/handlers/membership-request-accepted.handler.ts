import { UniqueEntityID } from '@app/shared/domain';
import { EventsHandler } from '@nestjs/cqrs';
import { CommunityMember } from '../../domain/entities/community-member.entity';
import { MembershipRequestAcceptedEvent } from '../../domain/events/membership-request-accepted.event';
import { CommunityMemberRepository } from '../../domain/repositories/community-member.repository';

@EventsHandler(MembershipRequestAcceptedEvent)
export class MembershipRequestAcceptedHandler {
  constructor(
    private readonly communityMemberRepository: CommunityMemberRepository,
  ) {}

  async handle(event: MembershipRequestAcceptedEvent): Promise<void> {
    const member = CommunityMember.create({
      communityId: UniqueEntityID.create(event.communityId),
      userId: UniqueEntityID.create(event.userId),
      admin: false,
    });
    await this.communityMemberRepository.save(member);
  }
}
