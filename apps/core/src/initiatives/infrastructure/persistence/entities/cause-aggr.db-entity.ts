import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('cause_aggrs')
export class CauseAggrDbEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'community_id', type: 'uuid' })
  communityId!: string;

  @Column({ default: false })
  closed!: boolean;
}
