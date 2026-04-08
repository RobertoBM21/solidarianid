import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { CauseDbEntity } from './cause.db-entity';
import { CommunityMemberDbEntity } from './community-member.db-entity';

@Entity('communities')
export class CommunityDbEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  description!: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => CommunityMemberDbEntity, (member) => member.community, {
    onDelete: 'CASCADE',
  })
  members!: CommunityMemberDbEntity[];

  @OneToMany(() => CauseDbEntity, (cause) => cause.community, {
    onDelete: 'CASCADE',
    cascade: true,
    orphanedRowAction: 'delete',
  })
  causes!: CauseDbEntity[];
}
