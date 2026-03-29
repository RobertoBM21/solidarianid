import { ChildEntity, Column } from 'typeorm';
import { ActionDbEntity } from './action.db-entity';

@ChildEntity('volunteering')
export class VolunteeringActionDbEntity extends ActionDbEntity {
  @Column({ type: 'timestamptz', nullable: true })
  start: Date;

  @Column({ type: 'timestamptz', nullable: true })
  end: Date;
}
