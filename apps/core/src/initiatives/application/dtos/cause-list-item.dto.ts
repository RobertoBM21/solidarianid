import { Cause } from '../../domain/aggregates/cause.aggregate';

export class CauseListItemDto {
  /**
   * The ID of the cause
   */
  readonly id: string;

  /**
   * The title of the cause
   */
  readonly title: string;

  /**
   * The description of the cause
   */
  readonly description: string;

  /**
   * The duration of the cause
   */
  readonly duration: string;

  /**
   * The ODS number (1-17)
   */
  readonly ods: number;

  /**
   * Whether the cause is closed
   */
  readonly closed: boolean;

  /**
   * The creation date of the cause (ISO 8601 format)
   */
  readonly createdAt: string;

  /**
   * Whether the current user supports this cause (only present when authenticated)
   */
  readonly supportedByUser?: boolean;

  constructor(cause: Cause, supportedByUser?: boolean) {
    this.id = cause.id.toString();
    this.title = cause.title;
    this.description = cause.description;
    this.duration = cause.duration;
    this.ods = cause.ods;
    this.closed = cause.closed;
    this.createdAt = cause.createdAt.toISOString();
    this.supportedByUser = supportedByUser;
  }
}
