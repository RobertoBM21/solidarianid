import { Cause } from '../../domain/aggregates/cause.aggregate';
import { ActionOutDto } from './action-out.dto';

export class CauseOutDto {
  readonly id: string;
  readonly communityId: string;
  readonly title: string;
  readonly description: string;
  readonly duration: string;
  readonly ods: number;
  readonly closed: boolean;
  readonly createdAt: string;
  readonly actions?: ActionOutDto[];

  constructor(cause: Cause, actions?: ActionOutDto[]) {
    this.id = cause.id.toString();
    this.communityId = cause.communityId.toString();
    this.title = cause.title;
    this.description = cause.description;
    this.duration = cause.duration;
    this.ods = cause.ods;
    this.closed = cause.closed;
    this.createdAt = cause.createdAt.toISOString();
    this.actions = actions;
  }
}
