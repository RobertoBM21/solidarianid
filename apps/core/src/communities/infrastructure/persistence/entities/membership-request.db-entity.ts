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

@Entity('membership_requests')
@Unique(['communityId', 'userId'])
export class MembershipRequestDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'community_id', type: 'uuid' })
  communityId: string;

  @ManyToOne(() => CommunityDbEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'community_id' })
  community: Relation<CommunityDbEntity>;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'boolean', nullable: true })
  accepted: boolean | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
