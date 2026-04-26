import { UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { MembershipRequestRejectedEvent } from '../../domain/events/membership-request-rejected.event';
import { MembershipNotificationsPort } from '../ports/membership-notifications.port';
import { MembershipRequestRejectedHandler } from './membership-request-rejected.handler';

describe('MembershipRequestRejectedHandler', () => {
  let handler: MembershipRequestRejectedHandler;
  const mockMembershipNotificationsPort = {
    sendMembershipRejected: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipRequestRejectedHandler,
        {
          provide: MembershipNotificationsPort,
          useValue: mockMembershipNotificationsPort,
        },
      ],
    }).compile();

    handler = module.get<MembershipRequestRejectedHandler>(
      MembershipRequestRejectedHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle MembershipRequestRejectedEvent', async () => {
    const communityId = UniqueEntityID.create().toString();
    const userId = UniqueEntityID.create().toString();
    const event = new MembershipRequestRejectedEvent(communityId, userId);

    mockMembershipNotificationsPort.sendMembershipRejected.mockResolvedValue(
      undefined,
    );

    await expect(handler.handle(event)).resolves.toBeUndefined();
    expect(
      mockMembershipNotificationsPort.sendMembershipRejected,
    ).toHaveBeenCalledWith(userId, communityId);
  });
});
