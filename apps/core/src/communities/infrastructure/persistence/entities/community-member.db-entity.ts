import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
  Unique,
} from 'typeorm';
import { CommunityDbEntity } from './community.db-entity';

@Entity('community_members')
@Unique(['communityId', 'userId'])
export class CommunityMemberDbEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'community_id', type: 'uuid' })
  communityId!: string;

  @ManyToOne(() => CommunityDbEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'community_id' })
  community!: Relation<CommunityDbEntity>;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'boolean' })
  admin!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
