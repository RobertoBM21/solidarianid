import { Cause } from '../../domain/aggregates/cause.aggregate';

export class CauseOutDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly duration: string;
  readonly ods: number;
  readonly closed: boolean;
  readonly createdAt: string;

  constructor(cause: Cause) {
    this.id = cause.id.toString();
    this.title = cause.title;
    this.description = cause.description;
    this.duration = cause.duration;
    this.ods = cause.ods;
    this.closed = cause.closed;
    this.createdAt = cause.createdAt.toISOString();
  }
}
