import { Column, Entity, PrimaryColumn } from 'typeorm';

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
}
