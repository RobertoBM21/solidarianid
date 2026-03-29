import { ChildEntity, Column } from 'typeorm';
import { ActionDbEntity } from './action.db-entity';

@ChildEntity('funding')
export class FundingActionDbEntity extends ActionDbEntity {
  @Column({
    name: 'target_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
    nullable: true,
  })
  targetAmount: number;

  @Column({
    name: 'current_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
    nullable: true,
  })
  currentAmount: number;
}
