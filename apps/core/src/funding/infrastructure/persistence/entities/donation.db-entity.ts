import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity('donations')
@Unique(['externalPaymentId'])
export class DonationDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'action_id', type: 'uuid' })
  actionId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'external_payment_id', type: 'varchar' })
  externalPaymentId: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
