import { UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityMember } from '../../domain/entities/community-member.entity';
import { MembershipRequestAcceptedEvent } from '../../domain/events/membership-request-accepted.event';
import { CommunityMemberRepository } from '../../domain/repositories/community-member.repository';
import { MembershipRequestAcceptedHandler } from './membership-request-accepted.handler';

describe('MembershipRequestAcceptedHandler', () => {
  let handler: MembershipRequestAcceptedHandler;

  const mockCommunityMemberRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipRequestAcceptedHandler,
        {
          provide: CommunityMemberRepository,
          useValue: mockCommunityMemberRepository,
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

  it('should save new member when MembershipRequestAcceptedEvent is handled', async () => {
    const communityId = UniqueEntityID.create().toString();
    const userId = UniqueEntityID.create().toString();
    const event = new MembershipRequestAcceptedEvent(communityId, userId);

    mockCommunityMemberRepository.save.mockResolvedValue(undefined);

    await handler.handle(event);

    expect(mockCommunityMemberRepository.save).toHaveBeenCalledWith(
      expect.any(CommunityMember),
    );

    const savedMember = mockCommunityMemberRepository.save.mock.calls[0][0];
    expect(savedMember.communityId.toString()).toBe(communityId);
    expect(savedMember.userId.toString()).toBe(userId);
    expect(savedMember.admin).toBe(false);
  });
});
