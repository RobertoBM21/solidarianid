import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity('community_members')
@Unique(['communityId', 'userId'])
export class CommunityMemberDbEntity {
  @PrimaryColumn('uuid', { default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ name: 'community_id', type: 'uuid' })
  communityId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'boolean', default: false })
  admin: boolean;
}
