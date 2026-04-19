import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('volunteering_actions')
export class VolunteeringActionAggrDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'cause_id', type: 'uuid' })
  causeId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'boolean', default: false })
  closed: boolean;
}
