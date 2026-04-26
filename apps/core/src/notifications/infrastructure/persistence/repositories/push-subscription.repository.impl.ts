import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EntityManager } from 'typeorm';
import {
  PushSubscriptionRepository,
  UserPushSubscriptionRecord,
} from '../../../application/ports/push-subscription-repository.port';
import { PushSubscriptionDbEntity } from '../entities/push-subscription.db-entity';

@Injectable()
export class PushSubscriptionRepositoryImpl extends PushSubscriptionRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async save(
    userId: string,
    subscription: UserPushSubscriptionRecord['subscription'],
  ): Promise<void> {
    const existing = await this.em.findOne(PushSubscriptionDbEntity, {
      where: { endpoint: subscription.endpoint },
    });

    const dbEntity = existing ?? new PushSubscriptionDbEntity();
    dbEntity.id = existing?.id ?? randomUUID();
    dbEntity.userId = userId;
    dbEntity.endpoint = subscription.endpoint;
    dbEntity.expirationTime = subscription.expirationTime;
    dbEntity.p256dh = subscription.keys.p256dh;
    dbEntity.auth = subscription.keys.auth;
    dbEntity.createdAt = existing?.createdAt ?? new Date();

    await this.em.save(PushSubscriptionDbEntity, dbEntity);
  }

  async findByUserId(userId: string): Promise<UserPushSubscriptionRecord[]> {
    const entities = await this.em.find(PushSubscriptionDbEntity, {
      where: { userId },
    });

    return entities.map((entity) => ({
      userId: entity.userId,
      subscription: {
        endpoint: entity.endpoint,
        expirationTime: entity.expirationTime,
        keys: {
          p256dh: entity.p256dh,
          auth: entity.auth,
        },
      },
    }));
  }

  async deleteByUserIdAndEndpoint(
    userId: string,
    endpoint: string,
  ): Promise<void> {
    await this.em.delete(PushSubscriptionDbEntity, {
      userId,
      endpoint,
    });
  }
}
