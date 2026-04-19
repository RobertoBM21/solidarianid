import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('volunteer_logs')
export class VolunteerLogDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'action_id', type: 'uuid' })
  actionId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamptz' })
  start: Date;

  @Column({ type: 'timestamptz' })
  end: Date;
}
