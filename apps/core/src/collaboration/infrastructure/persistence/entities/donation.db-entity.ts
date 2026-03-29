import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { UserDbEntity } from '../../../../identity/infrastructure/persistence/entities/user.db-entity';
import { ActionDbEntity } from '../../../../initiatives/infrastructure/persistence/entities/action.db-entity';

@Entity('donations')
export class DonationDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'action_id', type: 'uuid' })
  actionId: string;

  @ManyToOne(() => ActionDbEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'action_id' })
  action: Relation<ActionDbEntity>;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserDbEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserDbEntity>;

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
