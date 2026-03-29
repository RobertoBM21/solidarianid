import { Column, Entity, PrimaryColumn, TableInheritance } from 'typeorm';

@Entity('actions')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class ActionDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'cause_id', type: 'uuid' })
  causeId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', array: true })
  objectives: string[];

  @Column({ type: 'boolean', default: false })
  closed: boolean;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
