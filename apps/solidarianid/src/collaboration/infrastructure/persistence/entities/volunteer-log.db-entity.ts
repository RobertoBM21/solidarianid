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

@Entity('volunteer_logs')
export class VolunteerLogDbEntity {
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

  @Column({ type: 'timestamptz' })
  start: Date;

  @Column({ type: 'timestamptz' })
  end: Date;
}
