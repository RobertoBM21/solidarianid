import { Community } from '../../domain/community.aggregate';

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

  constructor(data: Community) {
    this.id = data.id.toString();
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.createdAt.toISOString();
  }
}
