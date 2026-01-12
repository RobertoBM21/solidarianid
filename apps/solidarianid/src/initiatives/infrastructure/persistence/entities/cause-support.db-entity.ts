import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { UserDbEntity } from '../../../../identity/infrastructure/persistence/entities/user.db-entity';
import { AnonymousUserDbEntity } from './anonymous-user.db-entity';
import { CauseDbEntity } from './cause.db-entity';

@Entity('cause_supports')
export class CauseSupportDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'cause_id', type: 'uuid' })
  causeId: string;

  @ManyToOne(() => CauseDbEntity, (cause) => cause.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cause_id' })
  cause: Relation<CauseDbEntity>;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => UserDbEntity, (user) => user.id, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user?: UserDbEntity | null;

  @Column({ name: 'anonymous_user_id', type: 'uuid', nullable: true })
  anonymousUserId: string | null;

  @ManyToOne(() => AnonymousUserDbEntity, (anonymousUser) => anonymousUser.id, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'anonymous_user_id' })
  anonymousUser?: AnonymousUserDbEntity | null;

  @Column({ type: 'timestamptz' })
  createdAt: Date;
}
