import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushNotificationPort } from './application/ports/push-notification.port';
import { PushSubscriptionRepository } from './application/ports/push-subscription-repository.port';
import { PushSubscriptionsPort } from './application/ports/push-subscriptions.port';
import { PushSubscriptionsService } from './application/services/push-subscriptions.service';
import { WebPushNotificationsAdapter } from './infrastructure/adapters/web-push-notifications.adapter';
import vapidConfig from './infrastructure/config/vapid.config';
import { NotificationsIntegrationService } from './infrastructure/notifications-integration.service';
import { PushSubscriptionDbEntity } from './infrastructure/persistence/entities/push-subscription.db-entity';
import { PushSubscriptionRepositoryImpl } from './infrastructure/persistence/repositories/push-subscription.repository.impl';
import { PushSubscriptionsController } from './infrastructure/presentation/controllers/push-subscriptions.controller';

@Module({
  imports: [
    ConfigModule.forFeature(vapidConfig),
    TypeOrmModule.forFeature([PushSubscriptionDbEntity]),
  ],
  providers: [
    {
      provide: PushSubscriptionRepository,
      useClass: PushSubscriptionRepositoryImpl,
    },
    {
      provide: PushNotificationPort,
      useClass: WebPushNotificationsAdapter,
    },
    {
      provide: PushSubscriptionsPort,
      useClass: PushSubscriptionsService,
    },

    NotificationsIntegrationService,
  ],
  exports: [NotificationsIntegrationService],
  controllers: [PushSubscriptionsController],
})
export class NotificationsModule {}
