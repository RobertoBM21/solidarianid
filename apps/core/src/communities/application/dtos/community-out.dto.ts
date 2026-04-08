import { Community } from '../../domain/community.aggregate';
import { Cause } from '../../domain/entities/cause.entity';

export class CommunityOutDto {
  /**
   * The unique identifier of the community.
   */
  readonly id: string;

  /**
   * The name of the community.
   */
  readonly name: string;

  /**
   * The description of the community.
   */
  readonly description: string;

  /**
   * The creation date of the community (ISO 8601 format).
   */
  readonly createdAt: string;

  /**
   * The list of causes associated with the community.
   */
  readonly causes: CauseDto[];

  constructor(data: Community) {
    this.id = data.id.toString();
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.createdAt.toISOString();
    this.causes = data.causes.map((cause) => new CauseDto(cause));
  }
}

export class CauseDto {
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
