import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity('push_subscriptions')
@Unique(['endpoint'])
export class PushSubscriptionDbEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'text' })
  endpoint!: string;

  @Column({ name: 'expiration_time', type: 'bigint', nullable: true })
  expirationTime!: number | null;

  @Column({ name: 'p256dh', type: 'text' })
  p256dh!: string;

  @Column({ name: 'auth', type: 'text' })
  auth!: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
