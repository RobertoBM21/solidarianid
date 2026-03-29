import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CommunityDbEntity } from '../../../../communities/infrastructure/persistence/entities/community.db-entity';

@Entity('causes')
export class CauseDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'community_id', type: 'uuid' })
  communityId: string;

  @ManyToOne(() => CommunityDbEntity, (community) => community.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'community_id' })
  community: CommunityDbEntity;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  duration: string;

  @Column({ type: 'smallint' })
  ods: number;

  @Column({ default: false })
  closed: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
