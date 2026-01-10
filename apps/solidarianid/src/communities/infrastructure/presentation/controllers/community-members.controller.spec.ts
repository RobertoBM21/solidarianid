import { left, right, UniqueEntityID } from '@app/shared/domain';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityMembersPort } from '../../../application/ports/community-members.port';
import {
  CannotExpelAdminError,
  MemberAlreadyAdminError,
} from '../../../domain/community-member.aggregate';
import { UserIsNotAdminError } from '../../../domain/community.aggregate';
import { CommunityMemberNotFoundError } from '../../../domain/repositories/community-member.repository';
import { CommunityMembersController } from './community-members.controller';

describe('CommunityMembersController', () => {
  let controller: CommunityMembersController;

  const mockCommunityMembersPort = {
    listMembers: jest.fn(),
    promoteMember: jest.fn(),
    expelMember: jest.fn(),
  };

  const communityId = UniqueEntityID.create().toString();
  const memberId = UniqueEntityID.create().toString();
  const requesterId = UniqueEntityID.create().toString();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityMembersController],
      providers: [
        {
          provide: CommunityMembersPort,
          useValue: mockCommunityMembersPort,
        },
      ],
    }).compile();

    controller = module.get<CommunityMembersController>(
      CommunityMembersController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listMembers', () => {
    it('should return list of members', async () => {
      const mockResult = [
        {
          id: memberId,
          communityId: communityId,
          userId: UniqueEntityID.create().toString(),
          admin: false,
        },
      ];
      mockCommunityMembersPort.listMembers.mockResolvedValue(right(mockResult));

      const result = await controller.listMembers(communityId, requesterId);

      expect(mockCommunityMembersPort.listMembers).toHaveBeenCalledWith(
        communityId,
        requesterId,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({ id: memberId }));
    });

    it('should throw ForbiddenException if user is not admin', async () => {
      mockCommunityMembersPort.listMembers.mockResolvedValue(
        left(new UserIsNotAdminError(communityId)),
      );

      await expect(
        controller.listMembers(communityId, requesterId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('promoteMember', () => {
    it('should promote member and return presenter', async () => {
      const mockResult = {
        id: memberId,
        communityId: communityId,
        userId: UniqueEntityID.create().toString(),
        admin: true,
      };
      mockCommunityMembersPort.promoteMember.mockResolvedValue(
        right(mockResult),
      );

      const result = await controller.promoteMember(memberId, requesterId);

      expect(mockCommunityMembersPort.promoteMember).toHaveBeenCalledWith(
        memberId,
        requesterId,
      );
      expect(result).toEqual(expect.objectContaining({ admin: true }));
    });

    it('should throw ForbiddenException if requester is not admin', async () => {
      mockCommunityMembersPort.promoteMember.mockResolvedValue(
        left(new UserIsNotAdminError(communityId)),
      );
      await expect(
        controller.promoteMember(memberId, requesterId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if member not found', async () => {
      mockCommunityMembersPort.promoteMember.mockResolvedValue(
        left(new CommunityMemberNotFoundError(memberId)),
      );

      await expect(
        controller.promoteMember(memberId, requesterId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if member already admin', async () => {
      mockCommunityMembersPort.promoteMember.mockResolvedValue(
        left(new MemberAlreadyAdminError()),
      );

      await expect(
        controller.promoteMember(memberId, requesterId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('expelMember', () => {
    it('should expel member and return nothing', async () => {
      mockCommunityMembersPort.expelMember.mockResolvedValue(right(undefined));

      await controller.expelMember(memberId, requesterId);

      expect(mockCommunityMembersPort.expelMember).toHaveBeenCalledWith(
        memberId,
        requesterId,
      );
    });

    it('should throw ForbiddenException if requester is not admin', async () => {
      mockCommunityMembersPort.expelMember.mockResolvedValue(
        left(new UserIsNotAdminError(communityId)),
      );
      await expect(
        controller.expelMember(memberId, requesterId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if member not found', async () => {
      mockCommunityMembersPort.expelMember.mockResolvedValue(
        left(new CommunityMemberNotFoundError(memberId)),
      );
      await expect(
        controller.expelMember(memberId, requesterId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if member is admin', async () => {
      mockCommunityMembersPort.expelMember.mockResolvedValue(
        left(new CannotExpelAdminError()),
      );
      await expect(
        controller.expelMember(memberId, requesterId),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
