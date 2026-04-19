import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  TableInheritance,
} from 'typeorm';
import { CauseAggrDbEntity } from './cause-aggr.db-entity';

@Entity('actions')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class ActionDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'cause_id', type: 'uuid' })
  causeId: string;

  @ManyToOne(() => CauseAggrDbEntity, (causeAggr) => causeAggr.actions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cause_id' })
  causeAggr!: CauseAggrDbEntity;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', array: true })
  objectives: string[];

  @Column({ type: 'boolean', default: false })
  closed: boolean;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
