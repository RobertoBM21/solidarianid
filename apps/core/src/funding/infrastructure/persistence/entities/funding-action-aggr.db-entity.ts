import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('funding_actions')
export class FundingActionAggrDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'cause_id', type: 'uuid' })
  causeId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'boolean', default: false })
  closed: boolean;

  @Column({
    name: 'current_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
    default: 0,
  })
  currentAmount: number;
}
