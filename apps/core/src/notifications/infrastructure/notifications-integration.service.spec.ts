import { UniqueEntityID } from '@app/shared/domain/entity';
import { Test, TestingModule } from '@nestjs/testing';
import { PushNotificationPort } from '../application/ports/push-notification.port';
import { PushSubscriptionRepository } from '../application/ports/push-subscription-repository.port';
import { NotificationsIntegrationService } from './notifications-integration.service';

describe('NotificationsIntegrationService', () => {
  const mockPushSubscriptionRepository: jest.Mocked<
    Pick<
      PushSubscriptionRepository,
      'findByUserId' | 'save' | 'deleteByUserIdAndEndpoint'
    >
  > = {
    findByUserId: jest.fn(),
    save: jest.fn(),
    deleteByUserIdAndEndpoint: jest.fn(),
  };

  const mockPushNotificationPort: jest.Mocked<
    Pick<PushNotificationPort, 'send'>
  > = {
    send: jest.fn(),
  };

  let service: NotificationsIntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsIntegrationService,
        {
          provide: PushSubscriptionRepository,
          useValue: mockPushSubscriptionRepository,
        },
        {
          provide: PushNotificationPort,
          useValue: mockPushNotificationPort,
        },
      ],
    }).compile();

    service = module.get(NotificationsIntegrationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send a notification to all subscriptions of a user', async () => {
    mockPushSubscriptionRepository.findByUserId.mockResolvedValue([
      {
        userId: UniqueEntityID.create().toString(),
        subscription: {
          endpoint: 'https://example.test/endpoint',
          expirationTime: null,
          keys: {
            p256dh: 'p256dh-value',
            auth: 'auth-value',
          },
        },
      },
    ]);

    mockPushNotificationPort.send.mockResolvedValue(undefined);

    await service.send(UniqueEntityID.create().toString(), {
      title: 'Membresía aceptada',
      body: 'Tu solicitud ha sido aceptada.',
      url: '/profile',
    });

    expect(mockPushNotificationPort.send).toHaveBeenCalledWith(
      {
        endpoint: 'https://example.test/endpoint',
        expirationTime: null,
        keys: {
          p256dh: 'p256dh-value',
          auth: 'auth-value',
        },
      },
      {
        title: 'Membresía aceptada',
        body: 'Tu solicitud ha sido aceptada.',
        url: '/profile',
      },
    );
  });

  it('should do nothing if the user has no push subscriptions', async () => {
    mockPushSubscriptionRepository.findByUserId.mockResolvedValue([]);

    await service.send(UniqueEntityID.create().toString(), {
      title: 'Membresía rechazada',
      body: 'Tu solicitud ha sido rechazada.',
      url: '/profile',
    });

    expect(mockPushNotificationPort.send).not.toHaveBeenCalled();
  });
});
