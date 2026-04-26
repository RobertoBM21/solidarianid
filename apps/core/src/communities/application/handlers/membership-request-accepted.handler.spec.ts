import { UniqueEntityID } from '@app/shared/domain';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityMember } from '../../domain/community-member.aggregate';
import { MembershipRequestAcceptedEvent } from '../../domain/events/membership-request-accepted.event';
import { CommunityMemberRepository } from '../../domain/repositories/community-member.repository';
import { MembershipNotificationsPort } from '../ports/membership-notifications.port';
import { MembershipRequestAcceptedHandler } from './membership-request-accepted.handler';

describe('MembershipRequestAcceptedHandler', () => {
  let handler: MembershipRequestAcceptedHandler;

  const mockCommunityMemberRepository = {
    save: jest.fn(),
  };
  const mockMembershipNotificationsPort = {
    sendMembershipAccepted: jest.fn(),
  };

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipRequestAcceptedHandler,
        {
          provide: CommunityMemberRepository,
          useValue: mockCommunityMemberRepository,
        },
        {
          provide: MembershipNotificationsPort,
          useValue: mockMembershipNotificationsPort,
        },
      ],
    }).compile();

    handler = module.get<MembershipRequestAcceptedHandler>(
      MembershipRequestAcceptedHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should save new member when MembershipRequestAcceptedEvent is handled', async () => {
    const communityId = UniqueEntityID.create().toString();
    const userId = UniqueEntityID.create().toString();
    const event = new MembershipRequestAcceptedEvent(communityId, userId);

    mockCommunityMemberRepository.save.mockResolvedValue(undefined);
    mockMembershipNotificationsPort.sendMembershipAccepted.mockResolvedValue(
      undefined,
    );

    await handler.handle(event);

    expect(mockCommunityMemberRepository.save).toHaveBeenCalledWith(
      expect.any(CommunityMember),
    );

    const savedMember: CommunityMember =
      mockCommunityMemberRepository.save.mock.calls[0][0];
    expect(savedMember.communityId.toString()).toBe(communityId);
    expect(savedMember.userId.toString()).toBe(userId);
    expect(savedMember.role.isAdmin()).toBe(false);
    expect(
      mockMembershipNotificationsPort.sendMembershipAccepted,
    ).toHaveBeenCalledWith(userId, communityId);
  });
});
