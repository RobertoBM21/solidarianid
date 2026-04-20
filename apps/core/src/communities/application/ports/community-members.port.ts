import { Either } from '@app/shared/domain';
import {
  CannotExpelAdminError,
  MemberAlreadyAdminError,
} from '../../domain/community-member.aggregate';
import { UserIsNotAdminError } from '../../domain/community.aggregate';
import { CommunityMemberNotFoundError } from '../../domain/repositories/community-member.repository';
import { CommunityMemberOutDto } from '../dtos/community-member-out.dto';

export abstract class CommunityMembersPort {
  abstract listMembers(
    communityId: string,
    requesterId: string,
  ): Promise<
    Either<
      UserIsNotAdminError | CommunityMemberNotFoundError,
      CommunityMemberOutDto[]
    >
  >;

  abstract promoteMember(
    memberId: string,
    requesterId: string,
  ): Promise<
    Either<
      | UserIsNotAdminError
      | CommunityMemberNotFoundError
      | MemberAlreadyAdminError,
      CommunityMemberOutDto
    >
  >;

  abstract leaveCommunity(
    communityId: string,
    userId: string,
  ): Promise<
    Either<CommunityMemberNotFoundError | CannotExpelAdminError, void>
  >;

  abstract expelMember(
    memberId: string,
    requesterId: string,
  ): Promise<
    Either<
      | UserIsNotAdminError
      | CommunityMemberNotFoundError
      | CannotExpelAdminError,
      void
    >
  >;
}
