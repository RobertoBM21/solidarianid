import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import {
  CannotExpelAdminError,
  MemberAlreadyAdminError,
} from '../../domain/community-member.aggregate';
import { UserIsNotAdminError } from '../../domain/community.aggregate';
import {
  CommunityMemberNotFoundError,
  CommunityMemberRepository,
} from '../../domain/repositories/community-member.repository';
import { CommunityMemberOutDto } from '../dtos/community-member-out.dto';
import { CommunityMembersPort } from '../ports/community-members.port';

@Injectable()
export class CommunityMembersService implements CommunityMembersPort {
  constructor(
    private readonly communityMemberRepository: CommunityMemberRepository,
  ) {}

  async listMembers(
    communityId: string,
    requesterId: string,
  ): Promise<
    Either<
      UserIsNotAdminError | CommunityMemberNotFoundError,
      CommunityMemberOutDto[]
    >
  > {
    const community = UniqueEntityID.create(communityId);
    const requester = UniqueEntityID.create(requesterId);

    const requesterMemberOrError =
      await this.communityMemberRepository.findByCommunityIdAndUserId(
        community,
        requester,
      );

    if (requesterMemberOrError.isLeft()) {
      return left(new CommunityMemberNotFoundError(communityId));
    }

    const requesterMember = requesterMemberOrError.value;
    if (!requesterMember.role.isAdmin()) {
      return left(new UserIsNotAdminError(communityId));
    }

    const members =
      await this.communityMemberRepository.findByCommunityId(community);
    return right(members.map((member) => new CommunityMemberOutDto(member)));
  }

  async promoteMember(
    memberId: string,
    requesterId: string,
  ): Promise<
    Either<
      | UserIsNotAdminError
      | CommunityMemberNotFoundError
      | MemberAlreadyAdminError,
      CommunityMemberOutDto
    >
  > {
    const requester = UniqueEntityID.create(requesterId);
    const member = UniqueEntityID.create(memberId);

    const memberOrError = await this.communityMemberRepository.findById(member);
    if (memberOrError.isLeft()) {
      return left(memberOrError.value);
    }
    const memberEntity = memberOrError.value;

    const requesterMemberOrError =
      await this.communityMemberRepository.findByCommunityIdAndUserId(
        memberEntity.communityId,
        requester,
      );

    if (requesterMemberOrError.isLeft()) {
      return left(
        new CommunityMemberNotFoundError(memberEntity.communityId.toString()),
      );
    }

    const requesterMember = requesterMemberOrError.value;
    if (!requesterMember.role.isAdmin()) {
      return left(new UserIsNotAdminError(memberEntity.communityId.toString()));
    }

    const promotionResult = memberEntity.promoteToAdmin();
    if (promotionResult.isLeft()) {
      return left(promotionResult.value);
    }

    await this.communityMemberRepository.save(memberEntity);

    const dto = new CommunityMemberOutDto(memberEntity);
    return right(dto);
  }

  async leaveCommunity(
    communityId: string,
    userId: string,
  ): Promise<
    Either<CommunityMemberNotFoundError | CannotExpelAdminError, void>
  > {
    const community = UniqueEntityID.create(communityId);
    const user = UniqueEntityID.create(userId);

    const memberOrError =
      await this.communityMemberRepository.findByCommunityIdAndUserId(
        community,
        user,
      );
    if (memberOrError.isLeft()) {
      return left(memberOrError.value);
    }

    const memberEntity = memberOrError.value;
    const canBeRemoved = memberEntity.ensureCanBeRemoved();
    if (canBeRemoved.isLeft()) {
      return left(canBeRemoved.value);
    }

    const removeResult = await this.communityMemberRepository.remove(
      memberEntity.id,
    );
    if (removeResult.isLeft()) {
      return left(removeResult.value);
    }

    return right(undefined);
  }

  async expelMember(
    memberId: string,
    requesterId: string,
  ): Promise<
    Either<
      | UserIsNotAdminError
      | CommunityMemberNotFoundError
      | CannotExpelAdminError,
      void
    >
  > {
    const requester = UniqueEntityID.create(requesterId);
    const member = UniqueEntityID.create(memberId);

    const memberOrError = await this.communityMemberRepository.findById(member);
    if (memberOrError.isLeft()) {
      return left(memberOrError.value);
    }
    const memberEntity = memberOrError.value;

    const requesterMemberOrError =
      await this.communityMemberRepository.findByCommunityIdAndUserId(
        memberEntity.communityId,
        requester,
      );

    if (requesterMemberOrError.isLeft()) {
      return left(
        new CommunityMemberNotFoundError(memberEntity.communityId.toString()),
      );
    }

    const requesterMember = requesterMemberOrError.value;
    if (!requesterMember.role.isAdmin()) {
      return left(new UserIsNotAdminError(memberEntity.communityId.toString()));
    }

    const canBeRemoved = memberEntity.ensureCanBeRemoved();
    if (canBeRemoved.isLeft()) {
      return left(canBeRemoved.value);
    }

    const removeResult = await this.communityMemberRepository.remove(
      memberEntity.id,
    );
    if (removeResult.isLeft()) {
      return left(removeResult.value);
    }

    return right(undefined);
  }
}
