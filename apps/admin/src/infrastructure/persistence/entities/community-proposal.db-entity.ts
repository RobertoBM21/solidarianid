import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('community_proposals')
export class CommunityProposalDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ name: 'requester_id', type: 'uuid' })
  requesterId: string;

  @Column({ type: 'boolean', nullable: true })
  accepted: boolean | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
