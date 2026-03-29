import { CommunityMember } from '../../domain/community-member.aggregate';
import { MemberRoles } from '../../domain/value-objects/member-role.vo';

export class CommunityMemberOutDto {
  /**
   * The unique identifier of the community member.
   */
  readonly id: string;

  /**
   * The unique identifier of the community.
   */
  readonly communityId: string;

  /**
   * The unique identifier of the user.
   */
  readonly userId: string;

  /**
   * The member's role in the community.
   */
  readonly role: MemberRoles;

  constructor(member: CommunityMember) {
    this.id = member.id.toString();
    this.communityId = member.communityId.toString();
    this.userId = member.userId.toString();
    this.role = member.role.asEnum();
  }
}
