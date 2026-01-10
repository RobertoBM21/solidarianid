import { left, right } from '@app/shared/domain';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 } from 'uuid';
import { UserIsNotAdminError } from '../../../domain/community.aggregate';
import { MembershipRequestStatus } from '../../../domain/membership-request-status.enum';
import {
  MembershipRequestAlreadyExistsError,
  MembershipRequestNotPendingError,
  UserAlreadyMemberError,
} from '../../../domain/membership-request.aggregate';
import { MembershipRequestsPort } from '../../../domain/ports/membership-requests.port';
import { CommunityNotFoundError } from '../../../domain/repositories/community.repository';
import { MembershipRequestNotFoundError } from '../../../domain/repositories/membership-request.repository';
import { MembershipRequestDto } from '../dtos/membership-request.dto';
import { ReviewMembershipRequestDto } from '../dtos/review-membership-request.dto';
import { MembershipRequestsController } from './membership-requests.controller';

describe('MembershipRequestsController', () => {
  let controller: MembershipRequestsController;

  const mockMembershipPort = {
    requestMembership: jest.fn(),
    listUserRequests: jest.fn(),
    listPendingRequests: jest.fn(),
    reviewRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembershipRequestsController],
      providers: [
        {
          provide: MembershipRequestsPort,
          useValue: mockMembershipPort,
        },
      ],
    }).compile();

    controller = module.get<MembershipRequestsController>(
      MembershipRequestsController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('requestMembership', () => {
    const communityId = v4();

    it('should request membership successfully', async () => {
      const userId = v4();
      const mockResult: MembershipRequestDto = {
        id: v4(),
        userId,
        communityId,
        status: MembershipRequestStatus.PENDING,
        createdAt: new Date().toISOString(),
      };

      mockMembershipPort.requestMembership.mockResolvedValue(right(mockResult));

      const result = await controller.requestMembership(communityId, userId);

      expect(mockMembershipPort.requestMembership).toHaveBeenCalledWith(
        expect.any(String),
        communityId,
      );
      expect(result).toEqual(expect.objectContaining({ id: mockResult.id }));
    });

    it('should throw NotFoundException given CommunityNotFoundError', async () => {
      mockMembershipPort.requestMembership.mockResolvedValue(
        left(new CommunityNotFoundError(communityId)),
      );

      const res = controller.requestMembership(communityId, v4());

      await expect(res).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException given MembershipRequestAlreadyExistsError', async () => {
      mockMembershipPort.requestMembership.mockResolvedValue(
        left(new MembershipRequestAlreadyExistsError()),
      );

      const res = controller.requestMembership(communityId, v4());

      await expect(res).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException given UserAlreadyMemberError', async () => {
      mockMembershipPort.requestMembership.mockResolvedValue(
        left(new UserAlreadyMemberError()),
      );

      const res = controller.requestMembership(communityId, v4());

      await expect(res).rejects.toThrow(BadRequestException);
    });
  });

  describe('listPendingRequests', () => {
    const communityId = v4();

    it('should list pending requests successfully', async () => {
      const userId = v4();
      const mockResult: MembershipRequestDto[] = [
        {
          id: v4(),
          userId,
          communityId,
          status: MembershipRequestStatus.PENDING,
          createdAt: new Date().toISOString(),
        },
      ];

      mockMembershipPort.listPendingRequests.mockResolvedValue(
        right(mockResult),
      );

      const result = await controller.listPendingRequests(communityId, userId);

      expect(mockMembershipPort.listPendingRequests).toHaveBeenCalledWith(
        expect.any(String),
        communityId,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({ id: expect.any(String) }),
      );
    });

    it('should throw NotFoundException given CommunityNotFoundError', async () => {
      mockMembershipPort.listPendingRequests.mockResolvedValue(
        left(new CommunityNotFoundError(communityId)),
      );

      const res = controller.listPendingRequests(communityId, v4());

      await expect(res).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException given UserIsNotAdminError', async () => {
      mockMembershipPort.listPendingRequests.mockResolvedValue(
        left(new UserIsNotAdminError(communityId)),
      );

      const res = controller.listPendingRequests(communityId, v4());

      await expect(res).rejects.toThrow(ForbiddenException);
    });
  });

  describe('reviewRequest', () => {
    const requestId = v4();
    const dto: ReviewMembershipRequestDto = {
      verdict: MembershipRequestStatus.ACCEPTED,
    };

    it('should review request successfully', async () => {
      const userId = v4();
      const mockResult: MembershipRequestDto = {
        id: requestId,
        userId,
        communityId: v4(),
        status: MembershipRequestStatus.ACCEPTED,
        createdAt: new Date().toISOString(),
      };

      mockMembershipPort.reviewRequest.mockResolvedValue(right(mockResult));

      const result = await controller.reviewRequest(requestId, userId, dto);

      expect(mockMembershipPort.reviewRequest).toHaveBeenCalledWith(
        expect.any(String),
        requestId,
        dto.verdict,
      );
      expect(result).toEqual(
        expect.objectContaining({ status: MembershipRequestStatus.ACCEPTED }),
      );
    });

    it('should throw NotFoundException given MembershipRequestNotFoundError', async () => {
      mockMembershipPort.reviewRequest.mockResolvedValue(
        left(new MembershipRequestNotFoundError(requestId)),
      );

      const res = controller.reviewRequest(requestId, v4(), dto);

      await expect(res).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException given MembershipRequestNotPendingError', async () => {
      mockMembershipPort.reviewRequest.mockResolvedValue(
        left(new MembershipRequestNotPendingError()),
      );

      const res = controller.reviewRequest(requestId, v4(), dto);

      await expect(res).rejects.toThrow(BadRequestException);
    });
  });

  describe('listMyRequests', () => {
    it('should list my requests successfully', async () => {
      const userId = v4();
      const mockResult: MembershipRequestDto[] = [
        {
          id: v4(),
          userId,
          communityId: v4(),
          status: MembershipRequestStatus.PENDING,
          createdAt: new Date().toISOString(),
        },
      ];

      mockMembershipPort.listUserRequests.mockResolvedValue(mockResult);

      const result = await controller.listMyRequests(userId);

      expect(mockMembershipPort.listUserRequests).toHaveBeenCalledWith(
        expect.any(String),
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({ id: expect.any(String) }),
      );
    });
  });
});
