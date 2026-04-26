import { UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { PushSubscriptionRepository } from '../ports/push-subscription-repository.port';
import { PushSubscriptionsService } from './push-subscriptions.service';

describe('PushSubscriptionsService', () => {
  const userId = UniqueEntityID.create().toString();

  const mockPushSubscriptionRepository: jest.Mocked<
    Pick<
      PushSubscriptionRepository,
      'save' | 'deleteByUserIdAndEndpoint' | 'findByUserId'
    >
  > = {
    save: jest.fn(),
    deleteByUserIdAndEndpoint: jest.fn(),
    findByUserId: jest.fn(),
  };

  let service: PushSubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushSubscriptionsService,
        {
          provide: PushSubscriptionRepository,
          useValue: mockPushSubscriptionRepository,
        },
      ],
    }).compile();

    service = module.get(PushSubscriptionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save a push subscription', async () => {
    mockPushSubscriptionRepository.save.mockResolvedValue(undefined);

    await service.registerSubscription(userId, {
      endpoint: 'https://example.test/endpoint',
      expirationTime: null,
      p256dh: 'p256dh-value',
      auth: 'auth-value',
    });

    expect(mockPushSubscriptionRepository.save).toHaveBeenCalledWith(userId, {
      endpoint: 'https://example.test/endpoint',
      expirationTime: null,
      keys: {
        p256dh: 'p256dh-value',
        auth: 'auth-value',
      },
    });
  });

  it('should remove a push subscription by user and endpoint', async () => {
    mockPushSubscriptionRepository.deleteByUserIdAndEndpoint.mockResolvedValue(
      undefined,
    );

    await service.removeSubscription(userId, 'https://example.test/endpoint');

    expect(
      mockPushSubscriptionRepository.deleteByUserIdAndEndpoint,
    ).toHaveBeenCalledWith(userId, 'https://example.test/endpoint');
  });
});
