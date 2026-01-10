import { UniqueEntityID, left, right } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CannotExpelAdminError,
  CommunityMember,
  MemberAlreadyAdminError,
} from '../../domain/community-member.aggregate';
import { UserIsNotAdminError } from '../../domain/community.aggregate';
import {
  CommunityMemberNotFoundError,
  CommunityMemberRepository,
} from '../../domain/repositories/community-member.repository';
import { MemberRoles } from '../../domain/value-objects/member-role.vo';
import { CommunityMemberOutDto } from '../dtos/community-member-out.dto';
import { CommunityMembersService } from './community-members.service';

describe('CommunityMembersService', () => {
  let service: CommunityMembersService;

  const mockCommunityMemberRepository = {
    findByCommunityId: jest.fn(),
    findById: jest.fn(),
    findByCommunityIdAndUserId: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const communityId = UniqueEntityID.create().toString();
  const requesterId = UniqueEntityID.create().toString();
  const nonAdminId = UniqueEntityID.create().toString();
  const notMemberId = UniqueEntityID.create().toString();
  const memberId = UniqueEntityID.create().toString();
  const targetUserId = UniqueEntityID.create().toString();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityMembersService,
        {
          provide: CommunityMemberRepository,
          useValue: mockCommunityMemberRepository,
        },
      ],
    }).compile();

    service = module.get<CommunityMembersService>(CommunityMembersService);
    jest.clearAllMocks();
  });

  describe('listMembers', () => {
    it('should fail if requester is not a member of the community', async () => {
      mockCommunityMemberRepository.findByCommunityIdAndUserId.mockResolvedValue(
        left(new CommunityMemberNotFoundError(communityId)),
      );

      const result = await service.listMembers(communityId, notMemberId);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(CommunityMemberNotFoundError);
    });

    it('should fail if requester is not admin', async () => {
      const requesterMember = CommunityMember.create({
        communityId: communityId,
        userId: nonAdminId,
        admin: false,
      });
      mockCommunityMemberRepository.findByCommunityIdAndUserId.mockResolvedValue(
        right(requesterMember),
      );

      const result = await service.listMembers(communityId, nonAdminId);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(UserIsNotAdminError);
    });

    it('should return member dtos', async () => {
      const requesterMember = CommunityMember.create({
        communityId: communityId,
        userId: requesterId,
        admin: true,
      });
      mockCommunityMemberRepository.findByCommunityIdAndUserId.mockResolvedValue(
        right(requesterMember),
      );

      const member = CommunityMember.create({
        communityId: communityId,
        userId: targetUserId,
        admin: false,
      });
      mockCommunityMemberRepository.findByCommunityId.mockResolvedValue([
        member,
      ]);

      const result = await service.listMembers(communityId, requesterId);

      expect(result.isRight()).toBe(true);
      expect(result.value).toHaveLength(1);
      if (result.isRight()) {
        expect(result.value[0]).toBeInstanceOf(CommunityMemberOutDto);
        expect(result.value[0].userId).toBe(targetUserId);
      }
    });
  });

  describe('promoteMember', () => {
    it('should fail if target member not found', async () => {
      mockCommunityMemberRepository.findById.mockResolvedValue(
        left(new CommunityMemberNotFoundError(memberId)),
      );

      const result = await service.promoteMember(memberId, requesterId);
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(CommunityMemberNotFoundError);
    });

    it('should fail if requester is not a member', async () => {
      const member = CommunityMember.create(
        {
          communityId: communityId,
          userId: targetUserId,
          admin: false,
        },
        memberId,
      );
      mockCommunityMemberRepository.findById.mockResolvedValue(right(member));
      mockCommunityMemberRepository.findByCommunityIdAndUserId.mockResolvedValue(
        left(new CommunityMemberNotFoundError(communityId)),
      );

      const result = await service.promoteMember(memberId, notMemberId);
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(CommunityMemberNotFoundError);
    });

    it('should fail if requester is not admin', async () => {
      const member = CommunityMember.create(
        {
          communityId: communityId,
          userId: targetUserId,
          admin: false,
        },
        memberId,
      );
      mockCommunityMemberRepository.findById.mockResolvedValue(right(member));

      const requesterMember = CommunityMember.create({
        communityId: communityId,
        userId: nonAdminId,
        admin: false,
      });
      mockCommunityMemberRepository.findByCommunityIdAndUserId.mockResolvedValue(
        right(requesterMember),
      );

      const result = await service.promoteMember(memberId, nonAdminId);
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(UserIsNotAdminError);
    });

    it('should fail if member is already admin', async () => {
      const member = CommunityMember.create(
        {
          communityId: communityId,
          userId: targetUserId,
          admin: true,
        },
        memberId,
      );
      mockCommunityMemberRepository.findById.mockResolvedValue(right(member));

      const requesterMember = CommunityMember.create({
        communityId: communityId,
        userId: requesterId,
        admin: true,
      });
      mockCommunityMemberRepository.findByCommunityIdAndUserId.mockResolvedValue(
        right(requesterMember),
      );

      const result = await service.promoteMember(memberId, requesterId);
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(MemberAlreadyAdminError);
    });

    it('should promote member', async () => {
      const member = CommunityMember.create(
        {
          communityId: communityId,
          userId: targetUserId,
          admin: false,
        },
        memberId,
      );
      mockCommunityMemberRepository.findById.mockResolvedValue(right(member));

      const requesterMember = CommunityMember.create({
        communityId: communityId,
        userId: requesterId,
        admin: true,
      });
      mockCommunityMemberRepository.findByCommunityIdAndUserId.mockResolvedValue(
        right(requesterMember),
      );

      const result = await service.promoteMember(memberId, requesterId);
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toBeInstanceOf(CommunityMemberOutDto);
        expect(result.value.role).toBe(MemberRoles.ADMIN);
      }
      expect(member.role.isAdmin()).toBe(true);
      expect(mockCommunityMemberRepository.save).toHaveBeenCalledWith(member);
    });
  });

  describe('expelMember', () => {
    it('should fail if member not found', async () => {
      mockCommunityMemberRepository.findById.mockResolvedValue(
        left(new CommunityMemberNotFoundError(memberId)),
      );

      const result = await service.expelMember(memberId, requesterId);
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(CommunityMemberNotFoundError);
    });

    it('should fail if requester is not a member', async () => {
      const member = CommunityMember.create(
        {
          communityId: communityId,
          userId: targetUserId,
          admin: false,
        },
        memberId,
      );
      mockCommunityMemberRepository.findById.mockResolvedValue(right(member));
      mockCommunityMemberRepository.findByCommunityIdAndUserId.mockResolvedValue(
        left(new CommunityMemberNotFoundError(communityId)),
      );

      const result = await service.expelMember(memberId, notMemberId);
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(CommunityMemberNotFoundError);
    });

    it('should fail if requester is not admin', async () => {
      const member = CommunityMember.create(
        {
          communityId: communityId,
          userId: targetUserId,
          admin: false,
        },
        memberId,
      );
      mockCommunityMemberRepository.findById.mockResolvedValue(right(member));

      const requesterMember = CommunityMember.create({
        communityId: communityId,
        userId: nonAdminId,
        admin: false,
      });
      mockCommunityMemberRepository.findByCommunityIdAndUserId.mockResolvedValue(
        right(requesterMember),
      );

      const result = await service.expelMember(memberId, nonAdminId);
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(UserIsNotAdminError);
    });

    it('should fail if member is admin', async () => {
      const member = CommunityMember.create(
        {
          communityId: communityId,
          userId: targetUserId,
          admin: true,
        },
        memberId,
      );
      mockCommunityMemberRepository.findById.mockResolvedValue(right(member));

      const requesterMember = CommunityMember.create({
        communityId: communityId,
        userId: requesterId,
        admin: true,
      });
      mockCommunityMemberRepository.findByCommunityIdAndUserId.mockResolvedValue(
        right(requesterMember),
      );

      const result = await service.expelMember(memberId, requesterId);
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(CannotExpelAdminError);
    });

    it('should expel member', async () => {
      const member = CommunityMember.create(
        {
          communityId: communityId,
          userId: targetUserId,
          admin: false,
        },
        memberId,
      );
      mockCommunityMemberRepository.findById.mockResolvedValue(right(member));
      mockCommunityMemberRepository.remove.mockResolvedValue(right(undefined));

      const requesterMember = CommunityMember.create({
        communityId: communityId,
        userId: requesterId,
        admin: true,
      });
      mockCommunityMemberRepository.findByCommunityIdAndUserId.mockResolvedValue(
        right(requesterMember),
      );

      const result = await service.expelMember(memberId, requesterId);
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toBeUndefined();
      }
      expect(mockCommunityMemberRepository.remove).toHaveBeenCalledWith(
        member.id,
      );
    });
  });
});
