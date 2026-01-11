import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { CommunityMemberDbEntity } from './community-member.db-entity';

@Entity('communities')
export class CommunityDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => CommunityMemberDbEntity, (member) => member.community, {
    onDelete: 'CASCADE',
  })
  members: CommunityMemberDbEntity[];
}
