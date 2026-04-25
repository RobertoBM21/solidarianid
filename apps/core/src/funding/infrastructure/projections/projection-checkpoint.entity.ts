import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('projection_checkpoints')
export class ProjectionCheckpointEntity {
  @PrimaryColumn()
  name: string;

  @Column({ type: 'varchar', length: 20 })
  position: string;
}
