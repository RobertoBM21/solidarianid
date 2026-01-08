import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('actions')
export class ActionDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'cause_id', type: 'uuid' })
  causeId: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

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

  @Column({ type: 'timestamptz', nullable: true })
  start: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  end: Date | null;

  @Column({
    name: 'target_amount',
    type: 'money',
    nullable: true,
  })
  targetAmount: number | null;

  @Column({
    name: 'current_amount',
    type: 'money',
  })
  currentAmount: number;
}
