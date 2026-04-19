import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ActionDbEntity } from './action.db-entity';

@Entity('cause_aggrs')
export class CauseAggrDbEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'community_id', type: 'uuid' })
  communityId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ default: false })
  closed!: boolean;

  @OneToMany(() => ActionDbEntity, (action) => action.causeAggr, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  actions!: ActionDbEntity[];
}
