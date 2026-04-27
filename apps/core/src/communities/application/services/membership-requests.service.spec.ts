import {
  DomainEventsPort,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { UserIsNotAdminError } from '../../domain/community.aggregate';
import { MembershipRequestStatus } from '../../domain/membership-request-status.enum';
import {
  MembershipRequest,
  MembershipRequestAlreadyExistsError,
  MembershipRequestNotPendingError,
  UserAlreadyMemberError,
} from '../../domain/membership-request.aggregate';
import {
  CommunityMemberNotFoundError,
  CommunityMemberRepository,
} from '../../domain/repositories/community-member.repository';
import {
  CommunityNotFoundError,
  CommunityRepository,
} from '../../domain/repositories/community.repository';
import {
  MembershipRequestNotFoundError,
  MembershipRequestRepository,
} from '../../domain/repositories/membership-request.repository';
import { MembershipNotificationsPort } from '../ports/membership-notifications.port';
import { MembershipRequestsService } from './membership-requests.service';

describe('MembershipRequestsService', () => {
  let service: MembershipRequestsService;

  const mockMembershipRepository = {
    findByUserId: jest.fn(),
    findByUserAndCommunity: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    findPendingByCommunityId: jest.fn(),
  };

  const mockCommunityRepository = {
    exists: jest.fn(),
    findById: jest.fn(),
  };

  const mockMemberRepository = {
    findByCommunityIdAndUserId: jest.fn(),
  };

  const mockDomainEvents = {
    dispatch: jest.fn(),
  };

  const mockMembershipNotificationsPort = {
    sendMembershipDecision: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipRequestsService,
        {
          provide: MembershipRequestRepository,
          useValue: mockMembershipRepository,
        },
        {
          provide: CommunityRepository,
          useValue: mockCommunityRepository,
        },
        {
          provide: CommunityMemberRepository,
          useValue: mockMemberRepository,
        },
        {
          provide: DomainEventsPort,
          useValue: mockDomainEvents,
        },
        {
          provide: MembershipNotificationsPort,
          useValue: mockMembershipNotificationsPort,
        },
      ],
    }).compile();

    service = module.get<MembershipRequestsService>(MembershipRequestsService);
    jest.clearAllMocks();
  });

  describe('requestMembership', () => {
    const userId = UniqueEntityID.create().toString();
    const communityId = UniqueEntityID.create().toString();

    it('should create a membership request successfully', async () => {
      mockCommunityRepository.exists.mockResolvedValue(true);
      mockMemberRepository.findByCommunityIdAndUserId.mockResolvedValue(
        left(new CommunityMemberNotFoundError(userId)),
      );
      mockMembershipRepository.findByUserAndCommunity.mockResolvedValue(
        left(new Error('Not found')),
      );
      mockMembershipRepository.save.mockResolvedValue(undefined);

      const result = await service.requestMembership(userId, communityId);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.status).toBe(MembershipRequestStatus.PENDING);
      }
      expect(mockMembershipRepository.save).toHaveBeenCalled();
    });

    it('should return error if community does not exist', async () => {
      mockCommunityRepository.exists.mockResolvedValue(false);

      const result = await service.requestMembership(userId, communityId);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(CommunityNotFoundError);
    });

    it('should return error if user is already a member', async () => {
      mockCommunityRepository.exists.mockResolvedValue(true);
      mockMemberRepository.findByCommunityIdAndUserId.mockResolvedValue(
        right({}),
      );

      const result = await service.requestMembership(userId, communityId);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(UserAlreadyMemberError);
    });

    it('should return error if request already exists', async () => {
      mockCommunityRepository.exists.mockResolvedValue(true);
      mockMemberRepository.findByCommunityIdAndUserId.mockResolvedValue(
        left(new CommunityMemberNotFoundError(userId)),
      );
      mockMembershipRepository.findByUserAndCommunity.mockResolvedValue(
        right({}),
      );

      const result = await service.requestMembership(userId, communityId);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(MembershipRequestAlreadyExistsError);
    });
  });

  describe('reviewRequest', () => {
    const adminId = UniqueEntityID.create();
    const userId = UniqueEntityID.create();
    const communityId = UniqueEntityID.create();
    const requestId = UniqueEntityID.create();

    const mockCommunity = {
      id: communityId,
      name: 'Test Community',
      admins: {
        has: jest.fn(),
      },
    };

    it('should accept a request successfully', async () => {
      const mockRequest = MembershipRequest.create(
        {
          communityId: communityId.toString(),
          userId: userId.toString(),
        },
        requestId.toString(),
      ).value as MembershipRequest;

      mockMembershipRepository.findById.mockResolvedValue(right(mockRequest));
      mockCommunityRepository.findById.mockResolvedValue(right(mockCommunity));
      mockCommunity.admins.has.mockReturnValue(true);
      mockMembershipRepository.save.mockResolvedValue(undefined);
      mockDomainEvents.dispatch.mockResolvedValue(undefined);
      mockMembershipNotificationsPort.sendMembershipDecision.mockResolvedValue(
        undefined,
      );

      const result = await service.reviewRequest(
        adminId.toString(),
        requestId.toString(),
        MembershipRequestStatus.ACCEPTED,
      );

      expect(result.isRight()).toBe(true);
      expect(mockRequest.accepted).toBe(true);
      expect(
        mockMembershipNotificationsPort.sendMembershipDecision,
      ).toHaveBeenCalledWith(userId.toString(), 'Test Community', true);
    });

    it('should reject a request successfully', async () => {
      const mockRequest = MembershipRequest.create(
        {
          communityId: communityId.toString(),
          userId: userId.toString(),
        },
        requestId.toString(),
      ).value as MembershipRequest;

      mockMembershipRepository.findById.mockResolvedValue(right(mockRequest));
      mockCommunityRepository.findById.mockResolvedValue(right(mockCommunity));
      mockCommunity.admins.has.mockReturnValue(true);
      mockMembershipRepository.save.mockResolvedValue(undefined);
      mockDomainEvents.dispatch.mockResolvedValue(undefined);
      mockMembershipNotificationsPort.sendMembershipDecision.mockResolvedValue(
        undefined,
      );

      const result = await service.reviewRequest(
        adminId.toString(),
        requestId.toString(),
        MembershipRequestStatus.REJECTED,
      );

      expect(result.isRight()).toBe(true);
      expect(mockRequest.accepted).toBe(false);
      expect(
        mockMembershipNotificationsPort.sendMembershipDecision,
      ).toHaveBeenCalledWith(userId.toString(), 'Test Community', false);
    });

    it('should fail if user is not admin', async () => {
      const mockRequest = MembershipRequest.create(
        {
          communityId: communityId.toString(),
          userId: userId.toString(),
        },
        requestId.toString(),
      ).value as MembershipRequest;

      mockMembershipRepository.findById.mockResolvedValue(right(mockRequest));
      mockCommunityRepository.findById.mockResolvedValue(right(mockCommunity));
      mockCommunity.admins.has.mockReturnValue(false);

      const result = await service.reviewRequest(
        adminId.toString(),
        requestId.toString(),
        MembershipRequestStatus.ACCEPTED,
      );

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(UserIsNotAdminError);
    });

    it('should fail if request is not pending', async () => {
      const closedRequest = MembershipRequest.create(
        {
          communityId: communityId.toString(),
          userId: userId.toString(),
          accepted: true,
        },
        requestId.toString(),
      ).value as MembershipRequest;

      mockMembershipRepository.findById.mockResolvedValue(right(closedRequest));
      mockCommunityRepository.findById.mockResolvedValue(right(mockCommunity));
      mockCommunity.admins.has.mockReturnValue(true);

      const result = await service.reviewRequest(
        adminId.toString(),
        requestId.toString(),
        MembershipRequestStatus.REJECTED,
      );

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(MembershipRequestNotPendingError);
    });

    it('should fail if request not found', async () => {
      mockMembershipRepository.findById.mockResolvedValue(
        left(new MembershipRequestNotFoundError('id')),
      );

      const result = await service.reviewRequest(
        adminId.toString(),
        requestId.toString(),
        MembershipRequestStatus.ACCEPTED,
      );

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(MembershipRequestNotFoundError);
    });
  });
});
